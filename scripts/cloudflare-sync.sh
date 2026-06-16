#!/usr/bin/env bash
# ============================================================
#  Cloudflare → Git 同步脚本
#  拉取 Cloudflare Pages/KV/D1 配置快照，提交到 Git
#  使用: CLOUDFLARE_TOKEN=xxx CF_ACCOUNT_ID=xxx bash scripts/cloudflare-sync.sh
#  测试: SKIP_COMMIT=1 bash scripts/cloudflare-sync.sh
# ============================================================
set -euo pipefail

: "${CLOUDFLARE_TOKEN:=}"
: "${CF_ACCOUNT_ID:=}"
: "${GIT_BRANCH:=main}"
: "${GIT_COMMIT_MSG:=sync: Cloudflare 配置自动同步}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

log()   { echo "[$(date '+%H:%M:%S)] $*"; }
error() { echo "[$(date '+%H:%M:%S)] [ERROR] $*" >&2; }

# ------------------------------------------------------------
#  依赖检查
# ------------------------------------------------------------
check_deps() {
    for cmd in python3 curl git; do
        command -v "$cmd" >/dev/null || { error "缺少依赖: $cmd"; exit 1; }
    done
}

check_token() {
    [ -n "$CLOUDFLARE_TOKEN" ] || { error "CLOUDFLARE_TOKEN 未设置"; exit 1; }
    [ -n "$CF_ACCOUNT_ID" ] || { error "CF_ACCOUNT_ID 未设置"; exit 1; }
}

# ------------------------------------------------------------
#  API & 工具
# ------------------------------------------------------------
cf_api() {
    local method="$1" path="$2" data="${3:-}"
    local headers=(-H "Authorization: Bearer $CLOUDFLARE_TOKEN"
                   -H "Content-Type: application/json")
    local url="https://api.cloudflare.com/client/v4$path"
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        curl -s -X "$method" "${headers[@]}" --data "$data" "$url" 2>/dev/null
    else
        curl -s -X "$method" "${headers[@]}" "$url" 2>/dev/null
    fi
}

# JSON 敏感字段脱敏: 替换 password_hash / token / email 等为 [REDACTED]
redact_json() {
    python3 - <<'PYEOF'
import json, sys, re
content = sys.stdin.read()
try:
    data = json.loads(content)
except Exception:
    print(content)
    sys.exit(0)

sensitive_keys = ['password', 'password_hash', 'token', 'secret', 'jwt', 'api_key', 'apikey', 'email']
hash_patterns = [re.compile(r'^\$2[aby]?\$'), re.compile(r'^eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$')]

def walk(obj):
    if isinstance(obj, dict):
        for k, v in list(obj.items()):
            kl = str(k).lower()
            if any(s in kl for s in sensitive_keys):
                if isinstance(v, str) and len(v) > 4:
                    obj[k] = '[REDACTED]'
                    continue
            if isinstance(v, str):
                matched = False
                for pat in hash_patterns:
                    if pat.match(v):
                        obj[k] = '[REDACTED]'
                        matched = True
                        break
                if not matched and any(s in v.lower() for s in ['$2a$', '$2b$', '$2y$']) and len(v) > 30:
                    obj[k] = '[REDACTED]'
                continue
            walk(v)
    elif isinstance(obj, list):
        for item in obj:
            walk(item)

walk(data)
print(json.dumps(data, ensure_ascii=False, indent=2))
PYEOF
}

# ------------------------------------------------------------
#  同步 KV: 拉取所有命名空间所有 key 的值
# ------------------------------------------------------------
sync_kv() {
    log "同步 KV..."
    mkdir -p cloudflare/kv

    ns_list=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces?per_page=100")
    ns_count=$(echo "$ns_list" | python3 -c "import sys,json;d=json.load(sys.stdin);print(len(d.get('result',[])))")
    log "命名空间: $ns_count 个"

    for ns in $(echo "$ns_list" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for n in d.get('result', []):
    print(n['id'])
"); do
        ns_name=$(echo "$ns_list" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for n in d.get('result', []):
    if n['id'] == sys.argv[1]:
        print(n.get('title', 'kv'))
        break
" "$ns")

        keys_json=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$ns/keys?per_page=1000")
        keys=$(echo "$keys_json" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for k in d.get('result', []):
    print(k['name'])
")
        key_count=$(echo "$keys" | grep -c . || true)
        log "  $ns_name: $key_count 个 key"

        while IFS= read -r key; do
            [ -z "$key" ] && continue
            value=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$ns/values/$key")
            safe=$(echo "$key" | sed 's/:/_/g; s/\//_/g; s/@/_at_/g')
            # 处理 JSON 内容（会被脱敏）
            if echo "$value" | python3 -c "import sys,json;json.load(sys.stdin)" 2>/dev/null; then
                echo "$value" | redact_json > "cloudflare/kv/$safe.json"
            else
                printf '%s' "$value" > "cloudflare/kv/$safe.json"
            fi
        done <<< "$keys"

        # 保存 keys 索引
        echo "$keys_json" | redact_json > "cloudflare/kv_${ns_name}_keys.json"
    done
}

# ------------------------------------------------------------
#  同步 D1: 每个数据库的 schema + 表数据
# ------------------------------------------------------------
sync_d1() {
    log "同步 D1..."
    mkdir -p cloudflare/d1

    db_list=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/d1/database?per_page=100")
    db_count=$(echo "$db_list" | python3 -c "import sys,json;d=json.load(sys.stdin);print(len(d.get('result',[])))")
    log "数据库: $db_count 个"

    for db in $(echo "$db_list" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for n in d.get('result', []):
    print(n['uuid'])
"); do
        db_name=$(echo "$db_list" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for n in d.get('result', []):
    if n['uuid']==sys.argv[1]: print(n['name'])
" "$db")

        log "  $db_name"

        # 表列表
        tables=$(cf_api POST "/accounts/$CF_ACCOUNT_ID/d1/database/$db/query" '{"sql":"SELECT name FROM sqlite_master WHERE type=\"table\""}' | python3 -c "
import sys, json
d = json.load(sys.stdin)
for r in d.get('result', []):
    for row in r.get('results', []):
        t = row.get('name', '')
        if not t.startswith('_'): print(t)
")

        # schema
        schemas=$(cf_api POST "/accounts/$CF_ACCOUNT_ID/d1/database/$db/query" '{"sql":"SELECT sql FROM sqlite_master WHERE type=\"table\" AND name NOT LIKE \"\\_%\""}' | python3 -c "
import sys, json
d = json.load(sys.stdin)
out = []
for r in d.get('result', []):
    for row in r.get('results', []):
        out.append(row.get('sql', ''))
print(json.dumps(out, ensure_ascii=False))
")
        echo "{\"tables\":[$(echo "$tables" | tr '\n' ',' | sed 's/,$//')],\"schemas\":$schemas}" | python3 -m json.tool > "cloudflare/d1/${db}_schema.json" 2>/dev/null \
            || echo "{\"tables\":[$(echo "$tables" | tr '\n' ',' | sed 's/,$//')],\"schemas\":$schemas}" > "cloudflare/d1/${db}_schema.json"

        # 表数据
        while IFS= read -r table; do
            [ -z "$table" ] && continue
            rows=$(cf_api POST "/accounts/$CF_ACCOUNT_ID/d1/database/$db/query" "{\"sql\":\"SELECT * FROM $table LIMIT 100\"}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
out = []
for r in d.get('result', []):
    out.extend(r.get('results', []))
print(json.dumps(out, ensure_ascii=False))
")
            echo "{\"table\":\"$table\",\"rows\":$rows}" | redact_json > "cloudflare/d1/${db}_${table}.json"
            row_count=$(echo "$rows" | python3 -c "import sys,json;d=json.load(sys.stdin);print(len(d))")
            log "    $table: $row_count 行"
        done <<< "$tables"
    done
}

# ------------------------------------------------------------
#  同步 Pages 项目
# ------------------------------------------------------------
sync_pages() {
    log "同步 Pages..."

    projects=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/pages/projects?per_page=50" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for n in d.get('result', []):
    print(n['name'])
")

    while IFS= read -r proj; do
        [ -z "$proj" ] && continue
        proj_safe=$(echo "$proj" | sed 's/:/_/g; s/\//_/g')
        log "  $proj..."

        # 项目信息
        cf_api GET "/accounts/$CF_ACCOUNT_ID/pages/projects/$proj" | python3 -c "
import sys, json
d = json.load(sys.stdin)
r = d.get('result', {})
r.pop('canonical_deployment', None)
r.pop('latest_deployment', None)
print(json.dumps(r, ensure_ascii=False, indent=2))
" > "cloudflare/pages_${proj_safe}_project.json"

        # 部署列表
        cf_api GET "/accounts/$CF_ACCOUNT_ID/pages/projects/$proj/deployments?per_page=20" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = []
for dep in d.get('result', []):
    items.append({
        'id': dep.get('id'),
        'environment': dep.get('environment'),
        'url': dep.get('url'),
        'created_on': dep.get('created_on'),
        'updated_on': dep.get('updated_on'),
        'files_count': len(dep.get('files', []))
    })
print(json.dumps({'count': len(items), 'deployments': items}, ensure_ascii=False, indent=2))
" > "cloudflare/pages_${proj_safe}_deployments.json"
    done <<< "$projects"
}

# ------------------------------------------------------------
#  Git 提交
# ------------------------------------------------------------
git_commit() {
    log "提交 Git..."
    git add cloudflare/ scripts/ .github/
    if git diff --cached --quiet; then
        log "无变更"
        return 0
    fi

    local changed
    changed=$(git diff --cached --name-only | wc -l)
    log "$changed 个文件变更"

    local msg
    msg="$GIT_COMMIT_MSG
$(date +%Y-%m-%dT%H:%M:%S)
Cloudflare Pages/KV/D1 配置快照"
    git -c user.email="sync@local" -c user.name="sync" commit -m "$msg" 2>&1 | tail -3
}

# ------------------------------------------------------------
#  主流程
# ------------------------------------------------------------
main() {
    log "===== Cloudflare 配置同步 ====="
    check_deps
    check_token

    sync_kv
    sync_d1
    sync_pages

    if [ "${SKIP_COMMIT:-0}" = "1" ]; then
        log "跳过 Git 提交 (SKIP_COMMIT=1)"
    else
        git_commit
    fi

    log "===== 完成 ====="
}

main "$@"

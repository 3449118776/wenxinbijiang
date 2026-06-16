#!/usr/bin/env bash
# ============================================================
#  Git → Cloudflare 反向同步脚本
#  将 cloudflare/kv/ 里的 JSON 值写回 Cloudflare KV
#  将 cloudflare/d1/ 里的表数据写回 D1（REPLACE INTO）
#  使用:
#    CLOUDFLARE_TOKEN=xxx CF_ACCOUNT_ID=xxx bash scripts/git-to-cloudflare.sh
#    DRY_RUN=1 bash scripts/git-to-cloudflare.sh   # 只显示不写入
# ============================================================
set -euo pipefail

: "${CLOUDFLARE_TOKEN:=}"
: "${CF_ACCOUNT_ID:=}"
: "${KV_NAMESPACE_ID:=}"
: "${DRY_RUN:=0}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

_ts() { date +%H:%M:%S; }
log()   { echo "[$(_ts)] $*"; }
warn()  { echo "[$(_ts)] [WARN] $*" >&2; }
error() { echo "[$(_ts)] [ERROR] $*" >&2; }

# ------------------------------------------------------------
check_deps() {
    for cmd in python3 curl; do
        command -v "$cmd" >/dev/null || { error "缺少依赖: $cmd"; exit 1; }
    done
}
check_token() {
    [ -n "$CLOUDFLARE_TOKEN" ] || { error "CLOUDFLARE_TOKEN 未设置"; exit 1; }
    [ -n "$CF_ACCOUNT_ID" ] || { error "CF_ACCOUNT_ID 未设置"; exit 1; }
}

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

# JSON 辅助函数
json_success() { python3 "$SCRIPT_DIR/json_get_success.py"; }
json_errors()  { python3 "$SCRIPT_DIR/json_get_errors.py"; }

# ------------------------------------------------------------
#  KV: 把 cloudflare/kv/*.json → Cloudflare KV
#  注意: 含 [REDACTED] 的文件不会写回（保护敏感数据）
# ------------------------------------------------------------
push_kv() {
    log "KV (Git → Cloudflare)..."

    # 自动检测 WXBJ 命名空间
    if [ -z "$KV_NAMESPACE_ID" ]; then
        ns_list=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces?per_page=100")
        KV_NAMESPACE_ID=$(echo "$ns_list" | python3 "$SCRIPT_DIR/find_wxbj_ns.py")
        if [ -z "$KV_NAMESPACE_ID" ]; then error "未找到 WXBJ KV 命名空间"; return 1; fi
        log "自动检测命名空间: $KV_NAMESPACE_ID"
    fi

    local updated=0 skipped=0

    # 从 kv_*_keys.json 读取原始 key 名（比从文件名推断更可靠）
    local -a keys_list=()
    for keys_file in cloudflare/kv_*_keys.json; do
        [ -e "$keys_file" ] || continue
        while IFS= read -r k; do
            [ -n "$k" ] && keys_list+=("$k")
        done < <(python3 "$SCRIPT_DIR/read_kv_keys.py" "$keys_file")
    done

    # 若没有 keys 索引文件，则回退到扫描 cloudflare/kv/*.json 的文件名
    if [ ${#keys_list[@]} -eq 0 ]; then
        log "  未找到 keys 索引文件，从文件名推断"
        for f in cloudflare/kv/*.json; do
            [ -e "$f" ] || continue
            filename=$(basename "$f" .json)
            keys_list+=("$filename")
        done
    fi

    local key_count=${#keys_list[@]}
    log "  处理 $key_count 个 key"

    for key in "${keys_list[@]}"; do
        # 生成安全文件名
        local safe
        safe=$(echo "$key" | tr ':/' '__' | sed 's/@/_at_/g')
        local target_file="cloudflare/kv/$safe.json"

        if [ ! -f "$target_file" ]; then
            # 尝试不带 _at_ 的其他变体
            alt_file="cloudflare/kv/${key//:/_}.json"
            [ -f "$alt_file" ] && target_file="$alt_file" || { warn "  skip (file not found): $key"; ((skipped++)); continue; }
        fi

        # 读取内容
        local content
        content=$(cat "$target_file")
        [ -z "$content" ] && { warn "  skip (empty): $key"; ((skipped++)); continue; }

        # 跳过含 REDACTED 的敏感字段值
        echo "$content" | grep -q 'REDACTED' && { warn "  skip (sensitive): $key"; ((skipped++)); continue; }

        # 实际写入
        if [ "$DRY_RUN" = "1" ]; then
            log "  [DRY] $key"
        else
            local resp
            resp=$(curl -s -X PUT \
                -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
                -H "Content-Type: text/plain" \
                --data "$content" \
                "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$KV_NAMESPACE_ID/values/$key" 2>/dev/null)
            local success
            success=$(echo "$resp" | json_success)
            if [ "$success" = "True" ]; then
                ((updated++))
            else
                local err_msg
                err_msg=$(echo "$resp" | json_errors | cut -c1-60)
                warn "  fail: $key ($err_msg)"
            fi
        fi
    done

    log "  updated=$updated skipped=$skipped"
}

# ------------------------------------------------------------
#  辅助: 从表 JSON 文件生成 REPLACE INTO SQL
# ------------------------------------------------------------
gen_d1_sql() {
    python3 "$SCRIPT_DIR/gen_d1_sql.py" "$1" "$2"
}

# ------------------------------------------------------------
#  D1: 把 cloudflare/d1/*_<table>.json → D1 表 REPLACE INTO
#  注意: 含 [REDACTED] 的行不会写回
# ------------------------------------------------------------
push_d1() {
    log "D1 (Git → Cloudflare)..."

    db_list=$(cf_api GET "/accounts/$CF_ACCOUNT_ID/d1/database?per_page=100")

    # 识别所有 UUID 前缀的 _schema.json 文件
    local schemas
    schemas=$(ls cloudflare/d1/*_schema.json 2>/dev/null || true)
    [ -z "$schemas" ] && { warn "  未找到 D1 schema 文件"; return 0; }

    for schema_file in $schemas; do
        local uuid
        uuid=$(basename "$schema_file" | sed "s/_schema.json\$//")
        [ "${#uuid}" -lt 20 ] && continue

        local db_name
        db_name=$(echo "$db_list" | python3 "$SCRIPT_DIR/find_db_name.py" "$uuid" 2>/dev/null || echo "$uuid")

        log "  $db_name ($uuid)"

        # 遍历该数据库的所有表 JSON 文件
        for table_file in "cloudflare/d1/${uuid}_"*.json; do
            [ -e "$table_file" ] || continue
            local table_name
            table_name=$(basename "$table_file" | sed "s/${uuid}_//; s/\.json$//")

            # 跳过 schema 和系统表
            case "$table_name" in schema|sqlite_sequence|sqlite_*|d1_migrations) continue ;; esac

            # 生成 SQL
            local sql
            sql=$(gen_d1_sql "$table_file" "$table_name")

            [ -z "$sql" ] && { warn "    $table_name: skip (空或含敏感字段)"; continue; }

            if [ "$DRY_RUN" = "1" ]; then
                log "    [DRY] $table_name"
            else
                local body
                body=$(echo "$sql" | python3 "$SCRIPT_DIR/sql_to_json_body.py")
                local resp
                resp=$(cf_api POST "/accounts/$CF_ACCOUNT_ID/d1/database/$uuid/query" "$body")
                local success
                success=$(echo "$resp" | json_success)
                if [ "$success" = "True" ]; then
                    log "    $table_name: OK"
                else
                    local err_msg
                    err_msg=$(echo "$resp" | json_errors | cut -c1-80)
                    warn "    $table_name: FAILED ($err_msg)"
                fi
            fi
        done
    done
}

# ------------------------------------------------------------
#  主流程
# ------------------------------------------------------------
main() {
    log "===== Git → Cloudflare ====="
    [ "$DRY_RUN" = "1" ] && warn "[DRY RUN] 只显示，不写入"

    check_deps
    check_token
    push_kv
    push_d1
    log "===== 完成 ====="
}

main "$@"

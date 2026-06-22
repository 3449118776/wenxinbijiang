#!/bin/bash
# 自动生成 version.json，基于 git commit 计数 + 日期
set -e

COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_DATE=$(date -u +"%Y%m%d%H%M%S")

# 自增版本号：从 version.json 读取上次的 versionCode，+1
PREV_CODE=0
if [ -f www/version.json ]; then
  PREV_CODE=$(grep -o '"versionCode":[0-9]*' www/version.json | grep -o '[0-9]*' || echo "0")
fi
NEW_CODE=$((PREV_CODE + 1))

# 主版本号：用 commit_count 的前两位
MAJOR=$((COMMIT_COUNT / 100))
MINOR=$((COMMIT_COUNT % 100))

cat > www/version.json << EOF
{"version":"${MAJOR}.${MINOR}.${NEW_CODE}","versionCode":${NEW_CODE},"build":"${BUILD_DATE}","commit":"${COMMIT_HASH}","releaseNotes":"","downloadUrl":""}
EOF

echo "version.json 已更新: ${MAJOR}.${MINOR}.${NEW_CODE} (build ${BUILD_DATE}, commit ${COMMIT_HASH})"
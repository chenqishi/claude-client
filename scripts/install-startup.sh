#!/usr/bin/env bash
#
# Claude Client 开机自启安装/卸载脚本
# 用法:
#   bash scripts/install-startup.sh install [working_dir]
#   bash scripts/install-startup.sh uninstall
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

ACTION="${1:-}"
WORKING_DIR="${2:-$(pwd)}"

case "$ACTION" in
  install)
    echo "📦 正在安装开机自启..."
    echo "   工作目录: ${WORKING_DIR}"
    echo ""
    node "${PROJECT_DIR}/dist/cli.js" startup install --dir "${WORKING_DIR}"
    ;;
  uninstall)
    echo "📦 正在卸载开机自启..."
    echo ""
    node "${PROJECT_DIR}/dist/cli.js" startup uninstall
    ;;
  *)
    echo "用法:"
    echo "  bash scripts/install-startup.sh install [working_dir]    安装开机自启"
    echo "  bash scripts/install-startup.sh uninstall                卸载开机自启"
    exit 1
    ;;
esac

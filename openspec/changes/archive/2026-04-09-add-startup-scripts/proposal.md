## Why

用户希望 claude-client 开机后自动运行，无需手动启动。当前项目根目录有一个硬编码路径的 `start.vbs`，不具备通用性和可维护性。需要提供标准化的开机启动脚本，降低用户配置门槛，重点支持 Windows 平台。

## What Changes

- 新增 `scripts/install-startup.sh`（跨平台安装/卸载脚本），支持 Windows、macOS、Linux
- Windows：通过生成 `.vbs` 启动脚本 + 创建启动目录快捷方式实现开机自启
- macOS：生成 LaunchAgent plist 实现开机自启
- Linux：生成 systemd user service 实现开机自启
- 新增 `claude-client startup install` 和 `claude-client startup uninstall` CLI 子命令，提供交互式引导
- 移除根目录旧的 `start.vbs`，用新方案替代

## Capabilities

### New Capabilities
- `startup-scripts`: 开机自启管理能力，包含跨平台启动脚本生成、安装/卸载 CLI 命令、以及自动化配置

### Modified Capabilities

（无现有 spec 需要修改）

## Impact

- **CLI 入口** (`src/cli.ts`)：新增 `startup` 子命令（install/uninstall）
- **新增模块**：`src/commands/startup.ts`，封装启动脚本生成与安装逻辑
- **新增脚本**：`scripts/install-startup.sh`，独立的安装/卸载脚本
- **删除文件**：根目录 `start.vbs`（由新方案替代）
- **依赖**：无需新增外部依赖，使用系统原生能力（VBS、LaunchAgent、systemd）

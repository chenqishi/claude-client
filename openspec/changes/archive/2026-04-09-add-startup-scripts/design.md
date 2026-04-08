## Context

claude-client 是一个通过飞书远程控制本地 Claude Code 的 Node.js CLI 工具。当前用户需手动运行 `claude-client start` 来启动服务。项目根目录有一个硬编码路径的 `start.vbs`，仅适用于特定环境，缺乏通用性。

用户希望将 claude-client 配置为开机自启服务，免除手动操作。需要支持 Windows（主要）、macOS 和 Linux。

## Goals / Non-Goals

**Goals:**
- 提供跨平台的开机自启安装/卸载能力（Windows 优先）
- 通过 CLI 子命令交互式引导用户完成配置
- 自动检测项目路径和 Node.js 路径，生成正确的启动脚本
- 支持用户自定义工作目录参数

**Non-Goals:**
- 不实现 Windows Service 注册（过于复杂，VBS 启动方式已足够）
- 不实现图形化配置界面
- 不处理 auto-update 或进程守护（由系统原生能力保证）

## Decisions

### 1. CLI 子命令 vs 独立脚本

**选择**：同时提供两者——`claude-client startup install/uninstall` CLI 子命令 + `scripts/install-startup.sh` 独立脚本。

**理由**：
- CLI 子命令提供更好的用户体验和交互引导
- 独立脚本允许不安装全局包的用户也能使用
- 两者共享相同的核心逻辑（脚本生成模板）

**替代方案**：仅提供 CLI 命令 → 对未全局安装的用户不友好。

### 2. Windows 启动方式：启动目录快捷方式

**选择**：生成 `.vbs` 后台启动脚本 + 在 Windows 启动目录（`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`）创建快捷方式。

**理由**：
- 无需管理员权限
- 用户可在任务管理器"启动"选项卡中看到并管理
- 与现有 `start.vbs` 思路一致，但路径自动检测

**替代方案**：
- Windows Service（需 admin + 额外工具，过度工程）
- 注册表 Run 键（不够透明，用户难管理）

### 3. macOS 启动方式：LaunchAgent plist

**选择**：生成 `~/Library/LaunchAgents/com.claude-client.plist`。

**理由**：
- macOS 标准用户级自启方式
- 支持自动重启（KeepAlive）、日志输出配置
- 无需 sudo

### 4. Linux 启动方式：systemd user service

**选择**：生成 `~/.config/systemd/user/claude-client.service`。

**理由**：
- 主流 Linux 发行版标准方式
- 支持 `systemctl --user enable` 管理自启
- 提供 `After=network.target` 等依赖配置

### 5. 路径检测策略

**选择**：运行时通过 `process.execPath` 获取 Node 路径，通过 `process.cwd()` 或 `__dirname` 获取项目路径，同时允许用户通过参数覆盖。

**理由**：
- 避免硬编码，跨环境通用
- 全局安装时 `process.execPath` 能正确找到 node
- npx 运行时也能工作

## Risks / Trade-offs

- **[路径变化]** 用户移动项目目录后启动脚本失效 → 安装时提示用户路径已固定，提供 `uninstall + install` 的更新流程
- **[Node 版本变更]** nvm 等版本管理工具切换 Node 版本后路径变化 → 启动脚本中通过 `#!/usr/bin/env node` 或 `node` 命令查找（VBS 中使用完整路径并在 README 中提醒）
- **[WSL 兼容]** WSL 环境下 Windows 启动目录路径不同 → 检测 WSL 环境并提示用户手动配置或使用 Linux 方式

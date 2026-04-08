## ADDED Requirements

### Requirement: CLI startup install 命令
系统 SHALL 提供 `claude-client startup install` 子命令，交互式引导用户完成开机自启配置。

#### Scenario: Windows 下安装开机自启
- **WHEN** 用户在 Windows 上运行 `claude-client startup install`
- **THEN** 系统自动检测平台为 Windows，提示用户确认工作目录，生成 `.vbs` 启动脚本，在 Windows 启动目录创建快捷方式，并输出安装成功信息

#### Scenario: macOS 下安装开机自启
- **WHEN** 用户在 macOS 上运行 `claude-client startup install`
- **THEN** 系统自动检测平台为 macOS，生成 LaunchAgent plist 文件到 `~/Library/LaunchAgents/`，自动 load 并输出安装成功信息

#### Scenario: Linux 下安装开机自启
- **WHEN** 用户在 Linux 上运行 `claude-client startup install`
- **THEN** 系统自动检测平台为 Linux，生成 systemd user service 文件到 `~/.config/systemd/user/`，执行 `systemctl --user enable` 并输出安装成功信息

#### Scenario: 指定自定义工作目录
- **WHEN** 用户运行 `claude-client startup install --dir /path/to/project`
- **THEN** 系统使用指定路径作为 claude-client 启动时的工作目录，而非当前目录

### Requirement: CLI startup uninstall 命令
系统 SHALL 提供 `claude-client startup uninstall` 子命令，移除开机自启配置。

#### Scenario: Windows 下卸载开机自启
- **WHEN** 用户在 Windows 上运行 `claude-client startup uninstall`
- **THEN** 系统删除启动目录中的快捷方式和生成的 `.vbs` 脚本文件，并输出卸载成功信息

#### Scenario: macOS 下卸载开机自启
- **WHEN** 用户在 macOS 上运行 `claude-client startup uninstall`
- **THEN** 系统执行 `launchctl unload`，删除 plist 文件，并输出卸载成功信息

#### Scenario: Linux 下卸载开机自启
- **WHEN** 用户在 Linux 上运行 `claude-client startup uninstall`
- **THEN** 系统执行 `systemctl --user disable` 和 `systemctl --user stop`，删除 service 文件，并输出卸载成功信息

#### Scenario: 未安装时卸载
- **WHEN** 用户运行 `claude-client startup uninstall` 但未检测到已安装的启动配置
- **THEN** 系统输出提示信息"未检测到开机自启配置"，以退出码 0 正常退出

### Requirement: 跨平台路径自动检测
系统 SHALL 自动检测当前 Node.js 可执行文件路径和 claude-client 安装路径，生成启动脚本时使用检测到的绝对路径。

#### Scenario: 全局安装时的路径检测
- **WHEN** claude-client 通过 `npm install -g` 全局安装
- **THEN** 系统通过 `process.execPath` 获取 Node 路径，通过 `process.argv[1]` 或 `which claude-client` 获取 CLI 入口路径，启动脚本中使用这些绝对路径

#### Scenario: npx 运行时的路径检测
- **WHEN** 用户通过 `npx claude-client startup install` 运行
- **THEN** 系统仍能正确检测路径并生成可用的启动脚本

### Requirement: 启动脚本后台静默运行
生成的启动脚本 SHALL 在后台静默运行，不弹出命令行窗口。

#### Scenario: Windows VBS 后台启动
- **WHEN** Windows 启动目录触发开机自启
- **THEN** `.vbs` 脚本以隐藏窗口方式运行 `claude-client start`，用户无感知命令行窗口

#### Scenario: macOS/Linux 后台启动
- **WHEN** LaunchAgent 或 systemd 触发开机自启
- **THEN** 服务以后台守护进程方式运行，日志输出到指定文件（macOS: `~/Library/Logs/claude-client.log`，Linux: 通过 journalctl 查看）

### Requirement: 独立安装脚本
系统 SHALL 提供 `scripts/install-startup.sh` 独立脚本，支持不依赖 CLI 命令直接运行安装/卸载。

#### Scenario: 通过独立脚本安装
- **WHEN** 用户运行 `bash scripts/install-startup.sh install`
- **THEN** 脚本执行与 `claude-client startup install` 相同的安装逻辑

#### Scenario: 通过独立脚本卸载
- **WHEN** 用户运行 `bash scripts/install-startup.sh uninstall`
- **THEN** 脚本执行与 `claude-client startup uninstall` 相同的卸载逻辑

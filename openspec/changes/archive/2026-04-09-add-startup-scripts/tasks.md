## 1. 启动脚本模板

- [x] 1.1 创建 `src/startup/templates.ts`，定义 Windows VBS、macOS LaunchAgent plist、Linux systemd service 三种启动脚本模板，模板中预留 node 路径、CLI 入口路径、工作目录等占位符
- [x] 1.2 创建 `src/startup/platforms/windows.ts`，实现 Windows 平台的安装逻辑：填充 VBS 模板 → 写入脚本文件 → 在启动目录创建快捷方式
- [x] 1.3 创建 `src/startup/platforms/macos.ts`，实现 macOS 平台的安装逻辑：填充 plist 模板 → 写入 `~/Library/LaunchAgents/com.claude-client.plist` → `launchctl load`
- [x] 1.4 创建 `src/startup/platforms/linux.ts`，实现 Linux 平台的安装逻辑：填充 service 模板 → 写入 `~/.config/systemd/user/claude-client.service` → `systemctl --user enable`
- [x] 1.5 为三个平台各自实现卸载逻辑：删除生成的文件 + 还原系统配置（launchctl unload / systemctl disable）

## 2. 路径检测与核心模块

- [x] 2.1 创建 `src/startup/detect.ts`，实现路径自动检测函数：通过 `process.execPath` 获取 Node 路径，通过 `process.argv` 和 `fs.realpathSync` 获取 CLI 入口绝对路径
- [x] 2.2 创建 `src/startup/index.ts`，整合平台检测（`process.platform`）、路径检测、模板填充，暴露 `install(workingDir)` 和 `uninstall()` 两个主函数
- [x] 2.3 添加错误处理：未安装时卸载给出友好提示，路径检测失败给出明确错误信息，权限不足时给出引导提示

## 3. CLI 子命令集成

- [x] 3.1 在 `src/cli.ts` 中新增 `startup` 子命令分支，支持 `startup install` 和 `startup uninstall` 两个操作
- [x] 3.2 支持 `--dir` 参数，允许用户指定 claude-client 启动时的工作目录，默认使用 `process.cwd()`
- [x] 3.3 添加 `startup` 相关帮助信息到 `showHelp()` 函数中

## 4. 独立安装脚本

- [x] 4.1 创建 `scripts/install-startup.sh`，接收 `install` 或 `uninstall` 参数，直接调用 node 执行 CLI 命令，提供不依赖全局安装的使用方式

## 5. 清理与验证

- [x] 5.1 删除根目录旧的 `start.vbs` 文件
- [x] 5.2 验证 Windows 平台 `startup install` 和 `startup uninstall` 命令正常工作
- [x] 5.3 TypeScript 编译通过，无类型错误

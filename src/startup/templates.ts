/**
 * 启动脚本模板
 */

export interface TemplateVars {
  nodePath: string;
  cliPath: string;
  workingDir: string;
  logPath: string;
}

/**
 * Windows VBS 启动脚本模板
 * 以隐藏窗口方式后台运行 claude-client
 * 使用 cmd /c 通过 PATH 查找 node，兼容 fnm/nvm 等版本管理器
 */
export function windowsVbsTemplate(vars: TemplateVars): string {
  const { cliPath, workingDir } = vars;
  // VBS 中反斜杠需要转义
  const escapedCliPath = cliPath.replace(/\\/g, '\\\\');
  const escapedWorkingDir = workingDir.replace(/\\/g, '\\\\');

  return `Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "${escapedWorkingDir}"
WshShell.Run "cmd /c node ""${escapedCliPath}"" start ""${escapedWorkingDir}""", 0, False
`;
}

/**
 * macOS LaunchAgent plist 模板
 */
export function macosPlistTemplate(vars: TemplateVars): string {
  const { nodePath, cliPath, workingDir, logPath } = vars;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude-client</string>
    <key>ProgramArguments</key>
    <array>
        <string>${nodePath}</string>
        <string>${cliPath}</string>
        <string>start</string>
        <string>${workingDir}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${workingDir}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${logPath}</string>
    <key>StandardErrorPath</key>
    <string>${logPath}</string>
</dict>
</plist>
`;
}

/**
 * Linux systemd user service 模板
 */
export function linuxServiceTemplate(vars: TemplateVars): string {
  const { nodePath, cliPath, workingDir } = vars;

  return `[Unit]
Description=Claude Client - Feishu Remote Control
After=network.target

[Service]
Type=simple
ExecStart=${nodePath} ${cliPath} start ${workingDir}
WorkingDirectory=${workingDir}
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
`;
}

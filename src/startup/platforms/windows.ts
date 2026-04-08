/**
 * Windows 平台启动管理
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { windowsVbsTemplate, type TemplateVars } from '../templates.js';

const SCRIPT_NAME = 'claude-client-startup.vbs';
const SHORTCUT_NAME = 'Claude Client Startup.lnk';

/**
 * 获取 Windows 启动目录路径
 */
function getStartupFolder(): string {
  const appData = process.env.APPDATA;
  if (!appData) {
    throw new Error('无法检测 Windows 启动目录: APPDATA 环境变量未设置');
  }
  return path.join(appData, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
}

/**
 * 获取 VBS 脚本保存路径（保存在启动目录中）
 */
function getVbsPath(): string {
  return path.join(getStartupFolder(), SCRIPT_NAME);
}

/**
 * 获取快捷方式路径
 */
function getShortcutPath(): string {
  return path.join(getStartupFolder(), SHORTCUT_NAME);
}

/**
 * 安装 Windows 开机自启
 */
export function install(workingDir: string, nodePath: string, cliPath: string): string {
  const vars: TemplateVars = {
    nodePath,
    cliPath,
    workingDir,
    logPath: path.join(workingDir, 'claude-client.log'),
  };

  const vbsContent = windowsVbsTemplate(vars);
  const vbsPath = getVbsPath();

  // 写入 VBS 脚本到启动目录
  fs.writeFileSync(vbsPath, vbsContent, 'utf-8');

  // 使用 PowerShell 创建快捷方式（更可靠，能在任务管理器启动项中显示）
  const shortcutPath = getShortcutPath();
  const psCommand = [
    `$ws = New-Object -ComObject WScript.Shell`,
    `$sc = $ws.CreateShortcut('${shortcutPath.replace(/'/g, "''")}')`,
    `$sc.TargetPath = '${vbsPath.replace(/'/g, "''")}'`,
    `$sc.WorkingDirectory = '${workingDir.replace(/'/g, "''")}'`,
    `$sc.Description = 'Claude Client - 飞书远程控制 Claude Code'`,
    `$sc.Save()`,
  ].join('; ');

  try {
    execSync(`powershell -NoProfile -Command "${psCommand.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      windowsHide: true,
    });
  } catch {
    // PowerShell 创建快捷方式失败时，VBS 文件已存在于启动目录，也能工作
    // 只是不会在任务管理器中显示友好的名称
  }

  return `Windows 开机自启已安装:
  - VBS 脚本: ${vbsPath}
  - 工作目录: ${workingDir}
  - Node 路径: ${nodePath}

提示: 可在任务管理器 > 启动 选项卡中管理`;
}

/**
 * 卸载 Windows 开机自启
 */
export function uninstall(): string {
  const vbsPath = getVbsPath();
  const shortcutPath = getShortcutPath();
  let removed: string[] = [];

  if (fs.existsSync(vbsPath)) {
    fs.unlinkSync(vbsPath);
    removed.push(SCRIPT_NAME);
  }

  if (fs.existsSync(shortcutPath)) {
    fs.unlinkSync(shortcutPath);
    removed.push(SHORTCUT_NAME);
  }

  if (removed.length === 0) {
    return '未检测到开机自启配置，无需卸载';
  }

  return `Windows 开机自启已卸载，已删除: ${removed.join(', ')}`;
}

/**
 * 检查是否已安装
 */
export function isInstalled(): boolean {
  return fs.existsSync(getVbsPath()) || fs.existsSync(getShortcutPath());
}

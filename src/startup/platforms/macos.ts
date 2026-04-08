/**
 * macOS 平台启动管理
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { macosPlistTemplate, type TemplateVars } from '../templates.js';

const PLIST_NAME = 'com.claude-client.plist';

/**
 * 获取 LaunchAgent plist 路径
 */
function getPlistPath(): string {
  const home = process.env.HOME;
  if (!home) {
    throw new Error('无法检测 macOS 主目录: HOME 环境变量未设置');
  }
  return path.join(home, 'Library', 'LaunchAgents', PLIST_NAME);
}

/**
 * 安装 macOS 开机自启
 */
export function install(workingDir: string, nodePath: string, cliPath: string): string {
  const home = process.env.HOME || '/tmp';
  const logPath = path.join(home, 'Library', 'Logs', 'claude-client.log');

  const vars: TemplateVars = {
    nodePath,
    cliPath,
    workingDir,
    logPath,
  };

  const plistContent = macosPlistTemplate(vars);
  const plistPath = getPlistPath();

  // 确保目录存在
  const plistDir = path.dirname(plistPath);
  if (!fs.existsSync(plistDir)) {
    fs.mkdirSync(plistDir, { recursive: true });
  }

  // 写入 plist 文件
  fs.writeFileSync(plistPath, plistContent, 'utf-8');

  // 加载 LaunchAgent
  try {
    execSync(`launchctl load ${plistPath}`, { encoding: 'utf-8' });
  } catch {
    // 如果已加载，先卸载再加载
    try {
      execSync(`launchctl unload ${plistPath}`, { encoding: 'utf-8' });
      execSync(`launchctl load ${plistPath}`, { encoding: 'utf-8' });
    } catch {
      // 忽略加载错误，文件已就位，下次登录时会自动加载
    }
  }

  return `macOS 开机自启已安装:
  - plist: ${plistPath}
  - 日志: ${logPath}
  - 工作目录: ${workingDir}

管理命令:
  查看状态: launchctl list | grep claude-client
  手动停止: launchctl unload ${plistPath}
  手动启动: launchctl load ${plistPath}`;
}

/**
 * 卸载 macOS 开机自启
 */
export function uninstall(): string {
  const plistPath = getPlistPath();

  if (!fs.existsSync(plistPath)) {
    return '未检测到开机自启配置，无需卸载';
  }

  // 先卸载
  try {
    execSync(`launchctl unload ${plistPath}`, { encoding: 'utf-8' });
  } catch {
    // 可能未加载，忽略错误
  }

  // 删除 plist 文件
  fs.unlinkSync(plistPath);

  return `macOS 开机自启已卸载，已删除: ${plistPath}`;
}

/**
 * 检查是否已安装
 */
export function isInstalled(): boolean {
  return fs.existsSync(getPlistPath());
}

/**
 * Linux 平台启动管理
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { linuxServiceTemplate, type TemplateVars } from '../templates.js';

const SERVICE_NAME = 'claude-client.service';

/**
 * 获取 systemd user service 目录路径
 */
function getServiceDir(): string {
  const home = process.env.HOME;
  if (!home) {
    throw new Error('无法检测 Linux 主目录: HOME 环境变量未设置');
  }
  return path.join(home, '.config', 'systemd', 'user');
}

/**
 * 获取 service 文件路径
 */
function getServicePath(): string {
  return path.join(getServiceDir(), SERVICE_NAME);
}

/**
 * 安装 Linux 开机自启
 */
export function install(workingDir: string, nodePath: string, cliPath: string): string {
  const vars: TemplateVars = {
    nodePath,
    cliPath,
    workingDir,
    logPath: '', // Linux 通过 journalctl 查看日志
  };

  const serviceContent = linuxServiceTemplate(vars);
  const servicePath = getServicePath();

  // 确保目录存在
  const serviceDir = getServiceDir();
  if (!fs.existsSync(serviceDir)) {
    fs.mkdirSync(serviceDir, { recursive: true });
  }

  // 写入 service 文件
  fs.writeFileSync(servicePath, serviceContent, 'utf-8');

  // 重载 systemd 并启用服务
  try {
    execSync('systemctl --user daemon-reload', { encoding: 'utf-8' });
    execSync(`systemctl --user enable ${SERVICE_NAME}`, { encoding: 'utf-8' });
    execSync(`systemctl --user start ${SERVICE_NAME}`, { encoding: 'utf-8' });
  } catch {
    // 某些环境可能不支持 systemd user service（如容器环境）
    // 文件已就位，用户可手动启用
  }

  return `Linux 开机自启已安装:
  - service: ${servicePath}
  - 工作目录: ${workingDir}

管理命令:
  查看状态: systemctl --user status ${SERVICE_NAME}
  查看日志: journalctl --user -u ${SERVICE_NAME} -f
  手动停止: systemctl --user stop ${SERVICE_NAME}
  手动启动: systemctl --user start ${SERVICE_NAME}`;
}

/**
 * 卸载 Linux 开机自启
 */
export function uninstall(): string {
  const servicePath = getServicePath();

  if (!fs.existsSync(servicePath)) {
    return '未检测到开机自启配置，无需卸载';
  }

  // 停止并禁用服务
  try {
    execSync(`systemctl --user stop ${SERVICE_NAME}`, { encoding: 'utf-8' });
    execSync(`systemctl --user disable ${SERVICE_NAME}`, { encoding: 'utf-8' });
  } catch {
    // 服务可能未运行，忽略错误
  }

  // 删除 service 文件
  fs.unlinkSync(servicePath);

  // 重载 systemd
  try {
    execSync('systemctl --user daemon-reload', { encoding: 'utf-8' });
  } catch {
    // 忽略
  }

  return `Linux 开机自启已卸载，已删除: ${servicePath}`;
}

/**
 * 检查是否已安装
 */
export function isInstalled(): boolean {
  return fs.existsSync(getServicePath());
}

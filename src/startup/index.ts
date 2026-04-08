/**
 * 开机自启管理模块
 */

import { detectPaths } from './detect.js';
import * as windows from './platforms/windows.js';
import * as macos from './platforms/macos.js';
import * as linux from './platforms/linux.js';

type Platform = 'win32' | 'darwin' | 'linux';

function getPlatformModule(platform: Platform) {
  switch (platform) {
    case 'win32':
      return windows;
    case 'darwin':
      return macos;
    case 'linux':
      return linux;
    default:
      throw new Error(`不支持的平台: ${platform}。当前仅支持 Windows、macOS 和 Linux。`);
  }
}

/**
 * 安装开机自启
 */
export function install(workingDir: string): string {
  const platform = process.platform as Platform;

  // 检测平台是否受支持
  if (!['win32', 'darwin', 'linux'].includes(platform)) {
    throw new Error(`不支持的平台: ${platform}。当前仅支持 Windows、macOS 和 Linux。`);
  }

  // 检测路径
  let paths;
  try {
    paths = detectPaths();
  } catch (error) {
    throw new Error(
      `路径检测失败: ${error instanceof Error ? error.message : error}\n` +
      '请确保 Node.js 和 claude-client 已正确安装。'
    );
  }

  const platformModule = getPlatformModule(platform);

  try {
    return platformModule.install(workingDir, paths.nodePath, paths.cliPath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'EACCES') {
      throw new Error(
        `权限不足，无法写入启动目录。\n` +
        '请尝试以管理员身份运行，或检查启动目录的写入权限。'
      );
    }
    throw new Error(
      `安装失败: ${error instanceof Error ? error.message : error}`
    );
  }
}

/**
 * 卸载开机自启
 */
export function uninstall(): string {
  const platform = process.platform as Platform;

  if (!['win32', 'darwin', 'linux'].includes(platform)) {
    throw new Error(`不支持的平台: ${platform}。当前仅支持 Windows、macOS 和 Linux。`);
  }

  const platformModule = getPlatformModule(platform);

  try {
    return platformModule.uninstall();
  } catch (error) {
    throw new Error(
      `卸载失败: ${error instanceof Error ? error.message : error}`
    );
  }
}

/**
 * 检查当前平台是否支持
 */
export function isPlatformSupported(): boolean {
  return ['win32', 'darwin', 'linux'].includes(process.platform);
}

/**
 * 获取当前平台名称（中文）
 */
export function getPlatformName(): string {
  switch (process.platform) {
    case 'win32':
      return 'Windows';
    case 'darwin':
      return 'macOS';
    case 'linux':
      return 'Linux';
    default:
      return process.platform;
  }
}

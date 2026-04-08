/**
 * 路径自动检测
 */

import { realpathSync } from 'fs';
import { resolve, dirname } from 'path';
import { execSync } from 'child_process';

export interface DetectedPaths {
  nodePath: string;
  cliPath: string;
}

/**
 * 检测 Node.js 可执行文件路径
 */
function detectNodePath(): string {
  return process.execPath;
}

/**
 * 检测 claude-client CLI 入口路径
 */
function detectCliPath(): string {
  // process.argv[1] 是当前执行的脚本路径
  const entryFile = process.argv[1];
  if (!entryFile) {
    throw new Error('无法检测 CLI 入口路径: process.argv[1] 为空');
  }

  // 解析为绝对路径（处理符号链接）
  const absolutePath = resolve(entryFile);
  try {
    return realpathSync(absolutePath);
  } catch {
    return absolutePath;
  }
}

/**
 * 检测全局安装时的 CLI 路径
 * 通过 `which claude-client` 或 `where claude-client` 查找
 */
function detectGlobalCliPath(): string | null {
  try {
    const command = process.platform === 'win32' ? 'where claude-client' : 'which claude-client';
    const result = execSync(command, { encoding: 'utf-8' }).trim();
    // where 可能返回多行，取第一行
    const firstLine = result.split('\n')[0].trim();
    try {
      return realpathSync(firstLine);
    } catch {
      return firstLine;
    }
  } catch {
    return null;
  }
}

/**
 * 自动检测 Node 和 CLI 路径
 */
export function detectPaths(): DetectedPaths {
  const nodePath = detectNodePath();

  // 优先使用全局命令路径（更稳定）
  const globalCli = detectGlobalCliPath();
  if (globalCli) {
    return { nodePath, cliPath: globalCli };
  }

  // 回退到当前执行的脚本路径
  const cliPath = detectCliPath();
  return { nodePath, cliPath };
}

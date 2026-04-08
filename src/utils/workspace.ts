/**
 * 工作目录工具模块
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 读取指定目录下的所有一级子文件夹，按字母排序返回
 */
export function getSubDirectories(workspaceDir: string): string[] {
  if (!fs.existsSync(workspaceDir)) {
    return [];
  }

  try {
    const stat = fs.statSync(workspaceDir);
    if (!stat.isDirectory()) {
      return [];
    }
  } catch {
    return [];
  }

  const entries = fs.readdirSync(workspaceDir, { withFileTypes: true });
  const directories = entries
    .filter(entry => entry.isDirectory())
    .map(entry => path.resolve(workspaceDir, entry.name))
    .sort((a, b) => a.localeCompare(b));

  return directories;
}

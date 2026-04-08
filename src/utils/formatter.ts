/**
 * 消息格式化和转换工具
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ClaudeMessage, ClaudeAssistantMessage, ClaudeResultMessage, SessionMessage } from '../types/index.js';

/**
 * 将 Claude 消息转换为飞书消息格式
 */
export function formatClaudeMessageForFeishu(message: ClaudeMessage): string {
  switch (message.type) {
    case 'assistant':
      return formatAssistantMessage(message as ClaudeAssistantMessage);

    case 'result': {
      const resultMsg = message as ClaudeResultMessage;
      // 只显示状态信息，不重复显示内容（内容已通过 assistant 消息显示）
      if (resultMsg.subtype === 'success') {
        return `✅ 任务完成`;
      } else {
        return `❌ 任务失败`;
      }
    }

    default:
      return '';
  }
}

/**
 * 格式化助手消息
 */
function formatAssistantMessage(message: ClaudeAssistantMessage): string {
  const parts: string[] = [];

  if (message.content) {
    for (const block of message.content) {
      switch (block.type) {
        case 'text':
          parts.push(block.text);
          break;

        case 'thinking':
          // 可选：显示思考过程
          // parts.push(`💭 *思考中...*\n${block.thinking}`);
          break;

        case 'tool_use':
          parts.push(formatToolCall(block.id, block.name, block.input));
          break;
      }
    }
  }

  return parts.join('\n\n');
}

/**
 * 格式化工具调用
 */
function formatToolCall(id: string, name: string, input: Record<string, unknown>): string {
  const toolEmoji = getToolEmoji(name);
  const description = getToolDescription(name, input);

  return `${toolEmoji} **${name}**\n${description}`;
}

/**
 * 获取工具表情符号
 */
function getToolEmoji(toolName: string): string {
  const emojiMap: Record<string, string> = {
    Read: '📖',
    Write: '✏️',
    Edit: '📝',
    Bash: '💻',
    Glob: '🔍',
    Grep: '🔎',
    WebSearch: '🌐',
    WebFetch: '📡',
    Task: '🤖',
  };

  return emojiMap[toolName] || '🔧';
}

/**
 * 获取工具描述
 */
function getToolDescription(toolName: string, input: Record<string, unknown>): string {
  switch (toolName) {
    case 'Read':
      return `读取文件: \`${input.file_path || input.file || 'unknown'}\``;

    case 'Write':
      return `写入文件: \`${input.file_path || input.file || 'unknown'}\``;

    case 'Edit':
      return `编辑文件: \`${input.file_path || input.file || 'unknown'}\``;

    case 'Bash':
      return `执行命令: \`${(input.command as string)?.substring(0, 50) || 'unknown'}\``;

    case 'Glob':
      return `搜索文件: \`${input.pattern || 'unknown'}\``;

    case 'Grep':
      return `搜索内容: \`${input.pattern || 'unknown'}\``;

    case 'WebSearch':
      return `搜索网络: \`${(input.query as string)?.substring(0, 50) || 'unknown'}\``;

    case 'WebFetch':
      return `获取网页: \`${(input.url as string)?.substring(0, 50) || 'unknown'}\``;

    case 'Task':
      return `子任务: ${(input.description as string)?.substring(0, 50) || (input.prompt as string)?.substring(0, 50) || 'unknown'}`;

    default:
      return `\`\`\`json\n${JSON.stringify(input, null, 2).substring(0, 200)}\n\`\`\``;
  }
}

/**
 * 格式化会话历史为上下文字符串
 */
export function formatHistoryForContext(messages: SessionMessage[]): string {
  if (messages.length === 0) {
    return '';
  }

  const parts: string[] = ['--- 对话历史 ---'];

  for (const msg of messages) {
    const role = msg.role === 'user' ? '👤 用户' : msg.role === 'assistant' ? '🤖 助手' : '系统';
    const time = new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    parts.push(`[${time}] ${role}:`);
    parts.push(msg.content.substring(0, 500) + (msg.content.length > 500 ? '...' : ''));
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * 截断消息以适应飞书消息长度限制
 */
export function truncateMessage(message: string, maxLength: number = 4000): string {
  if (message.length <= maxLength) {
    return message;
  }

  // 尝试在句子边界截断
  const truncated = message.substring(0, maxLength);
  const lastPeriod = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('\n')
  );

  if (lastPeriod > maxLength * 0.8) {
    return truncated.substring(0, lastPeriod + 1) + '\n\n... (消息过长，已截断)';
  }

  return truncated + '\n\n... (消息过长，已截断)';
}

/**
 * 检测消息中的特殊命令
 */
export function detectSpecialCommand(message: string): { type: string; args: string } | null {
  const trimmed = message.trim();

  // /clear - 清除会话
  if (trimmed === '/clear' || trimmed === '/reset') {
    return { type: 'clear', args: '' };
  }

  // /status - 查看状态
  if (trimmed === '/status') {
    return { type: 'status', args: '' };
  }

  // /pwd - 查看当前目录
  if (trimmed === '/pwd') {
    return { type: 'pwd', args: '' };
  }

  // /help - 帮助 (支持 ?, ??, /?, /help, 中文问号)
  if (trimmed === '/help' || trimmed === '/?' || trimmed === '?' || trimmed === '？' || trimmed === '??' || trimmed === '？？') {
    return { type: 'help', args: '' };
  }

  // /cd - 切换目录
  const cdMatch = trimmed.match(/^\/cd\s+(.+)$/);
  if (cdMatch) {
    return { type: 'cd', args: cdMatch[1] };
  }

  // /mode - 切换权限模式
  const modeMatch = trimmed.match(/^\/mode\s+(.+)$/);
  if (modeMatch) {
    return { type: 'mode', args: modeMatch[1] };
  }

  // /tasklist - 查看任务列表
  if (trimmed === '/tasklist' || trimmed === '/tasks') {
    return { type: 'tasklist', args: '' };
  }

  // /dirs - 查看目录列表
  if (trimmed === '/dirs') {
    return { type: 'dirs', args: '' };
  }

  // /resume - 恢复任务
  const resumeMatch = trimmed.match(/^\/resume\s+(.+)$/);
  if (resumeMatch) {
    return { type: 'resume', args: resumeMatch[1] };
  }

  // /taskdelete - 删除任务
  const taskDeleteMatch = trimmed.match(/^\/taskdelete\s+(.+)$/);
  if (taskDeleteMatch) {
    return { type: 'taskdelete', args: taskDeleteMatch[1] };
  }

  // /skills - Skill 列表
  if (trimmed === '/skills') {
    return { type: 'skills', args: '' };
  }

  // /skill-copy - 复制 skill 命令
  const skillCopyMatch = trimmed.match(/^\/skill-copy\s+(.+)$/);
  if (skillCopyMatch) {
    return { type: 'skill-copy', args: skillCopyMatch[1] };
  }

  return null;
}

/**
 * 目录记录接口
 */
export interface DirectoryRecord {
  path: string;
  lastAccessedAt: number;
  accessCount: number;
}

/**
 * Skill 定义接口
 */
export interface Skill {
  id: string;
  name: string;
  command: string;
  description: string;
}

/**
 * 从 SKILL.md 文件解析 name 和 description
 * 支持两种格式：
 * 1. YAML 前置数据（--- 包裹）
 * 2. Markdown 标题（# Title + 描述行）
 */
function parseSkillMeta(content: string, dirName: string): { name: string; description: string } | null {
  // 格式1: YAML 前置数据
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (yamlMatch) {
    const frontmatter = yamlMatch[1];
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
    if (nameMatch) {
      return {
        name: nameMatch[1].trim(),
        description: descMatch ? descMatch[1].trim() : '',
      };
    }
  }

  // 格式2: Markdown 标题 + 描述
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    const title = titleMatch[1].trim();
    // 尝试从描述/概述/触发词后提取描述
    const descMatch = content.match(/(?:描述|概述|简介|Description)[：:]\s*\n?\s*(.+)$/m);
    return {
      name: title,
      description: descMatch ? descMatch[1].trim() : '',
    };
  }

  // 格式3: 使用目录名
  return { name: dirName, description: '' };
}

/**
 * 从目录加载 skills（读取 SKILL.md 文件）
 */
function loadSkillsFromDir(skillsDir: string, commandPrefix: string): Skill[] {
  const skills: Skill[] = [];

  if (!fs.existsSync(skillsDir)) return skills;

  try {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;

      const content = fs.readFileSync(skillFile, 'utf-8');
      const meta = parseSkillMeta(content, entry.name);
      if (!meta) continue;

      skills.push({
        id: entry.name,
        name: meta.name,
        command: `${commandPrefix}${entry.name}`,
        description: meta.description,
      });
    }
  } catch {
    // ignore read errors
  }

  return skills;
}

/**
 * 从 .claude/commands/ 目录加载项目命令
 */
function loadCommandsFromDir(commandsDir: string): Skill[] {
  const skills: Skill[] = [];

  if (!fs.existsSync(commandsDir)) return skills;

  try {
    const walkDir = (dir: string, prefix: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath, `${prefix}${entry.name}:`);
        } else if (entry.name.endsWith('.md')) {
          const cmdName = entry.name.replace(/\.md$/, '');
          const command = `/${prefix}${cmdName}`;
          const content = fs.readFileSync(fullPath, 'utf-8');
          const meta = parseSkillMeta(content, cmdName);
          const description = meta?.description || '';
          skills.push({
            id: command,
            name: `${prefix}${cmdName}`,
            command,
            description,
          });
        }
      }
    };
    walkDir(commandsDir, '');
  } catch {
    // ignore read errors
  }

  return skills;
}

/**
 * 动态加载所有用户 skills（全局 + 项目级别）
 */
export function loadAllSkills(workingDir: string): Skill[] {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const skills: Skill[] = [];

  // 全局用户 skills: ~/.claude/skills/
  const globalSkillsDir = path.join(homeDir, '.claude', 'skills');
  skills.push(...loadSkillsFromDir(globalSkillsDir, '/'));

  // 项目级 skills: <workingDir>/.claude/skills/
  const projectSkillsDir = path.join(workingDir, '.claude', 'skills');
  skills.push(...loadSkillsFromDir(projectSkillsDir, '/'));

  // 项目级 commands: <workingDir>/.claude/commands/
  const projectCommandsDir = path.join(workingDir, '.claude', 'commands');
  skills.push(...loadCommandsFromDir(projectCommandsDir));

  return skills;
}

/**
 * 在 skill 列表中查找指定 skill
 */
export function findSkillById(skills: Skill[], id: string): Skill | undefined {
  return skills.find(skill => skill.id === id);
}

/**
 * 生成帮助卡片（带按钮，可点击发送命令）
 */
export function generateHelpCard(
  currentDirectory?: string,
  recentDirectories: DirectoryRecord[] = [],
  showDirListButton?: boolean,
): Record<string, unknown> {
  const elements: Array<Record<string, unknown>> = [];

  // 基本介绍
  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: '直接发送消息给机器人，Claude 会帮你处理任务。',
    },
  });

  // 当前目录
  if (currentDirectory) {
    elements.push({ tag: 'hr' });
    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `📍 **当前目录**\n\`${currentDirectory}\``,
      },
    });
  }

  // 最近访问的目录
  if (recentDirectories.length > 0) {
    elements.push({ tag: 'hr' });
    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: '**🔥 热门目录**',
      },
    });

    for (const dir of recentDirectories) {
      const dirName = dir.path.split(/[\\/]/).pop() || dir.path;
      const timeStr = new Date(dir.lastAccessedAt).toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      elements.push({
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: `📁 ${dirName}`,
            },
            type: 'default',
            value: {
              command: `/cd ${dir.path}`,
            },
          },
        ],
      });
    }
  }

  // 目录管理
  elements.push({ tag: 'hr' });
  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: '**📁 目录管理**',
    },
  });
  elements.push({
    tag: 'action',
    actions: [
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '查看当前目录',
        },
        type: 'default',
        value: {
          command: '/pwd',
        },
      },
      ...(showDirListButton ? [{
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '目录列表',
        },
        type: 'primary',
        value: {
          command: '/dirs',
        },
      }] : []),
    ],
  });

  // 会话管理
  elements.push({ tag: 'hr' });
  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: '**💬 会话管理**',
    },
  });
  elements.push({
    tag: 'action',
    actions: [
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '清除上下文',
        },
        type: 'default',
        value: {
          command: '/clear',
        },
      },
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '查看状态',
        },
        type: 'default',
        value: {
          command: '/status',
        },
      },
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '上下文列表',
        },
        type: 'primary',
        value: {
          command: '/tasklist',
        },
      },
    ],
  });

  // 权限模式
  elements.push({ tag: 'hr' });
  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: '**⚙️ 权限模式**',
    },
  });
  elements.push({
    tag: 'action',
    actions: [
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '默认',
        },
        type: 'default',
        value: {
          command: '/mode default',
        },
      },
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '自动编辑',
        },
        type: 'primary',
        value: {
          command: '/mode acceptEdits',
        },
      },
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '跳过权限',
        },
        type: 'danger',
        value: {
          command: '/mode bypassPermissions',
        },
      },
    ],
  });
  elements.push({
    tag: 'action',
    actions: [
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '计划模式',
        },
        type: 'default',
        value: {
          command: '/mode plan',
        },
      },
    ],
  });

  // Skill 列表
  elements.push({ tag: 'hr' });
  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: '**🎯 Skill 列表**',
    },
  });
  elements.push({
    tag: 'action',
    actions: [
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '查看 Skill 列表',
        },
        type: 'primary',
        value: {
          command: '/skills',
        },
      },
    ],
  });

  // 提示
  elements.push({ tag: 'hr' });
  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: '💡 群聊中需要 @ 机器人才能触发响应\n📝 切换目录: `/cd <目录路径>`',
    },
  });

  return {
    config: {
      wide_screen_mode: true,
    },
    header: {
      title: {
        tag: 'plain_text',
        content: 'Claude Client 使用指南',
      },
      template: 'blue',
    },
    elements,
  };
}

/**
 * 生成 Skill 列表卡片
 */
export function generateSkillListCard(skills: Skill[]): Record<string, unknown> {
  const elements: Array<Record<string, unknown>> = [];

  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: `共 **${skills.length}** 个可用 Skill，点击按钮复制命令。`,
    },
  });

  elements.push({ tag: 'hr' });

  // 每行最多 4 个按钮，紧凑排列
  const buttonsPerRow = 4;
  for (let i = 0; i < skills.length; i += buttonsPerRow) {
    const row = skills.slice(i, i + buttonsPerRow);
    elements.push({
      tag: 'action',
      actions: row.map(skill => ({
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: skill.name,
        },
        type: 'default',
        value: {
          command: `/skill-copy ${skill.id}`,
        },
      })),
    });
  }

  // 返回帮助按钮
  elements.push({ tag: 'hr' });
  elements.push({
    tag: 'action',
    actions: [
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '返回帮助',
        },
        type: 'default',
        value: {
          command: '/help',
        },
      },
    ],
  });

  return {
    config: {
      wide_screen_mode: true,
    },
    header: {
      title: {
        tag: 'plain_text',
        content: '🎯 Skill 列表',
      },
      template: 'blue',
    },
    elements,
  };
}

/**
 * 生成目录列表卡片
 */
export function generateDirectoryListCard(
  directories: string[],
  currentDir?: string,
): Record<string, unknown> {
  const elements: Array<Record<string, unknown>> = [];

  if (directories.length === 0) {
    return { elements: [] };
  }

  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: `📋 共 **${directories.length}** 个项目目录`,
    },
  });

  elements.push({ tag: 'hr' });

  for (const dir of directories) {
    const dirName = dir.split(/[\\/]/).pop() || dir;
    const isCurrent = currentDir && dir === currentDir;

    elements.push({
      tag: 'action',
      actions: [
        {
          tag: 'button',
          text: {
            tag: 'plain_text',
            content: `${isCurrent ? '📍 ' : '📁 '}${dirName}`,
          },
          type: isCurrent ? 'primary' : 'default',
          value: {
            command: `/cd ${dir}`,
          },
        },
      ],
    });
  }

  // 返回帮助按钮
  elements.push({ tag: 'hr' });
  elements.push({
    tag: 'action',
    actions: [
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '返回帮助',
        },
        type: 'default',
        value: {
          command: '/help',
        },
      },
    ],
  });

  return {
    config: {
      wide_screen_mode: true,
    },
    header: {
      title: {
        tag: 'plain_text',
        content: '📁 项目目录列表',
      },
      template: 'blue',
    },
    elements,
  };
}

/**
 * 生成帮助消息（纯文本格式）
 */
export function generateHelpMessage(): string {
  return `🤖 **Claude Client 使用指南**

**基本用法:**
直接发送消息给机器人，Claude 会帮你处理任务。

**目录管理:**
• \`/cd <目录>\` - 切换工作目录（同时清除上下文）
• \`/pwd\` - 查看当前工作目录

**会话管理:**
• \`/clear\` - 清除当前会话上下文
• \`/status\` - 查看会话状态

**权限模式:**
• \`/mode <模式>\` - 切换权限模式
  - \`acceptEdits\`: 自动批准文件编辑
  - \`bypassPermissions\`: 跳过所有权限检查
  - \`default\`: 需要手动批准

**其他:**
• \`/help\` - 显示此帮助信息

**示例:**
\`\`\`
/cd D:/code/myproject
读取 src/index.ts 文件
在当前目录创建一个新的 Python 文件
\`\`\`

**注意:**
• 群聊中需要 @ 机器人才能触发响应
• 工作目录设置会持久保存，不会随会话过期重置
`;
}

/**
 * 任务信息接口
 */
export interface TaskInfo {
  id: string;
  workingDirectory: string;
  claudeSessionId: string;
  lastMessage: string;
  updatedAt: number;
}

/**
 * 生成任务列表卡片（只显示当前目录的上下文）
 */
export function generateTaskListCard(
  tasks: TaskInfo[],
  currentDirectory?: string
): Record<string, unknown> {
  const elements: Array<Record<string, unknown>> = [];

  // 只显示当前目录的任务
  const currentDirTasks = tasks.filter(t => t.workingDirectory === currentDirectory);

  // 显示当前目录
  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: `📁 **${currentDirectory || '未知目录'}**`,
    },
  });

  if (currentDirTasks.length === 0) {
    elements.push({ tag: 'hr' });
    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: '暂无上下文记录\n\n💡 开始新对话后，上下文会自动保存在这里',
      },
    });
  } else {
    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `📋 **上下文列表** (${currentDirTasks.length}个)`,
      },
    });

    for (const task of currentDirTasks) {
      const timeStr = new Date(task.updatedAt).toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      elements.push({ tag: 'hr' });
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `${task.lastMessage ? task.lastMessage.substring(0, 100) + (task.lastMessage.length > 100 ? '...' : '') : '无最近消息'}`,
        },
      });
      elements.push({
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: '恢复上下文',
            },
            type: 'primary',
            value: {
              command: `/resume ${task.workingDirectory}`,
              sessionId: task.claudeSessionId,
            },
          },
          {
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: '删除',
            },
            type: 'danger',
            value: {
              command: `/taskdelete ${task.workingDirectory}`,
            },
          },
        ],
      });
      elements.push({
        tag: 'div',
        text: {
          tag: 'plain_text',
          content: `🕐 ${timeStr}`,
        },
      });
    }
  }

  return {
    config: {
      wide_screen_mode: true,
    },
    header: {
      title: {
        tag: 'plain_text',
        content: '📋 上下文列表',
      },
      template: 'blue',
    },
    elements,
  };
}

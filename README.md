# 🤖 Claude Client

中文文档 | [English](./README_EN.md)

**通过飞书远程控制本地 Claude Code CLI。**

Claude Client 将飞书即时通讯平台与 Claude Code CLI 桥接，使您可以通过手机或任何安装了飞书的设备远程与 Claude AI 交互。

## 📸 效果预览

### 实时流式进度更新
消息持续刷新，实时展示 Claude 的执行过程 - 工具调用、文件操作一目了然：

<img src="./imgs/streaming-demo.jpg" width="300" alt="流式进度更新示例">

### 交互式帮助卡片
发送 `?` 即可显示精美卡片，热门目录一键切换：

<img src="./imgs/card.jpg" width="300" alt="帮助卡片示例">

## 🌟 项目亮点

### 📱 随时随地写代码
通勤路上、会议间隙、离开工位时都能写代码、重构文件或调试问题。无需 VPN 或远程桌面 - 只需要飞书。

### 🔄 实时流式进度更新
**核心亮点**：飞书消息持续更新，实时展示 Claude 的执行过程！
- **动态消息更新**：同一条消息实时刷新，展示当前执行状态
- **工具调用可视化**：清晰显示 Claude 正在使用的工具（📁 读取文件、🔧 执行命令、🔍 搜索代码等）
- **进度感知**：即使任务耗时较长，用户也能实时看到进展，不再焦虑等待
- **智能截断**：超长消息自动截断，保证飞书消息发送成功

### 🖥️ 跨平台兼容
- **Windows 优化**：通过文件轮询机制解决 Windows 上的 stdout 管道缓冲问题
- **统一体验**：Windows、macOS、Linux 上一致的使用体验

### 🔥 智能目录管理
- **热门目录**：快速访问最近使用的 5 个项目
- **目录级上下文**：每个项目维护独立的对话历史
- **一键恢复**：继续之前的任务，无需重新解释上下文

### 🎯 交互式体验
精美的飞书卡片配合可点击按钮 - 无需记忆命令。点击即可切换目录、更改模式或恢复任务。

### 📝 可配置的变更记录
自动记录所有变更：
- **Git 模式**：自动提交，可自定义消息模板，包含 diff
- **飞书文档**：直接写入飞书文档
- **可扩展**：易于添加更多记录后端

### 🛡️ 企业级就绪
- 消息去重防止重复处理
- 按聊天持久化工作目录
- 多种权限模式控制安全
- 会话超时自动过期

## ✨ 功能特性

- 📱 **飞书集成** - 通过飞书机器人与 Claude 交互（私聊或群聊）
- 🔄 **实时进度** - 每 30 秒更新进度，显示进程状态
- 📁 **目录管理** - 切换项目目录，热门目录快速访问
- 💬 **会话持久化** - 恢复之前的对话，保持上下文
- 🔐 **权限模式** - 多种权限模式满足不同安全需求
- 📝 **变更记录** - 可配置的变更记录（Git 提交、飞书文档等）
- 🛠️ **完整工具支持** - 文件操作、命令执行、网络搜索等
- 🎯 **交互式卡片** - 精美的飞书卡片，支持点击按钮

## 📋 环境要求

- Node.js >= 18.0.0
- 已安装 Claude Code CLI ([安装指南](https://docs.anthropic.com/en/docs/claude-code))
- 飞书开发者账号 ([飞书开放平台](https://open.feishu.cn/))

## 🚀 快速开始

### 1. 克隆并安装

```bash
git clone https://github.com/YOUR_USERNAME/claude-client.git
cd claude-client
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 飞书机器人配置
FEISHU_APP_ID=cli_xxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxx
FEISHU_DOMAIN=feishu  # 国际版使用 'lark'

# 服务器配置
PORT=3000
HOST=0.0.0.0

# 可选：Claude API Key（通常由 CLI 管理）
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx

# 可选：指定 Claude CLI 路径（WSL 用户可能需要）
# CLAUDE_CODE_PATH=/home/xxx/.nvm/versions/node/v24.x.x/bin/claude

# 可选：工作目录根路径（配置后帮助卡片显示目录列表按钮）
WORKSPACE_DIR=D:\code
```

> **WSL 用户注意**：如果在 WSL 中运行项目，可能需要设置 `CLAUDE_CODE_PATH` 环境变量。
> 使用 `which claude` 查看完整路径，然后配置到 `.env` 中。

### 3. 安装 Claude Code CLI

```bash
# macOS/Linux
brew install claude

# 或通过 npm
npm install -g @anthropic-ai/claude-code

# 验证安装
claude --version
```

### 4. 配置飞书机器人

#### 4.1 创建飞书应用

1. 前往 [飞书开放平台](https://open.feishu.cn/) 并登录
2. 点击「创建企业自建应用」
3. 填写应用名称和描述，上传头像

#### 4.2 获取应用凭证

在应用详情页的「凭证与基础信息」中获取：
- **App ID** → 对应 `FEISHU_APP_ID`
- **App Secret** → 对应 `FEISHU_APP_SECRET`

#### 4.3 配置事件订阅

1. 进入「事件订阅」页面
2. **订阅方式**：选择「使用长连接接收事件」
3. 获取以下凭证：
   - **Encrypt Key** → 对应 `FEISHU_ENCRYPT_KEY`
   - **Verification Token** → 对应 `FEISHU_VERIFICATION_TOKEN`
4. **添加事件**：点击「添加事件」，搜索并订阅：
   - `im.message.receive_v1` - 接收消息（必需）
5. **配置卡片回调**：在「卡片配置」中添加：
   - `card.action.trigger` - 卡片按钮点击回调（用于帮助卡片交互）

#### 4.4 添加应用权限

在「权限管理」→「申请权限」中添加以下权限：

**方式一：批量导入（推荐）**

1. 点击「申请权限」页面右上角的「导入权限」按钮
2. 将 [imgs/feishu-permissions.json](./imgs/feishu-permissions.json) 文件内容粘贴到输入框
3. 点击确认导入

![导入权限](./imgs/feishu-permissions-import.jpg)

**方式二：手动添加**

在「应用能力」→「机器人」中：
1. 启用机器人功能
2. 搜索并添加以下权限：
   - `im:message` - 获取与发送单聊、群聊消息
   - `im:message:send_as_bot` - 以机器人身份发送消息
   - `im:message.group_at_msg:readonly` - 获取群组中@机器人消息
   - `im:chat` - 获取群组信息
   - `im:chat.members:bot_access` - 获取群成员列表
   - `cardkit:card:write` - 发送卡片消息（用于帮助卡片）

#### 4.5 发布应用

1. 在「版本管理与发布」中创建版本
2. 提交审核（企业内部应用可跳过审核）
3. 发布后，在飞书中搜索应用名称即可使用

#### 4.6 配置环境变量

将获取的凭证填入 `.env` 文件：

```env
# 飞书机器人配置
FEISHU_APP_ID=cli_xxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxx
FEISHU_ENCRYPT_KEY=xxxxxxxxxxxxxxxxxxxx
FEISHU_VERIFICATION_TOKEN=xxxxxxxxxxxxxxxxxxxx
FEISHU_DOMAIN=feishu  # 国际版使用 'lark'
```

### 5. 构建并运行

```bash
npm run build
npm start
```

或开发模式运行：

```bash
npm run dev
```

## 📖 使用方法

### 飞书通知机制详解

本项目实现了**实时流式飞书通知**系统，让您在发送命令给 Claude Code 后，能够实时看到执行进度和最终结果。

#### 通知工作流程

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  飞书客户端  │ ──▶  │ 飞书机器人    │ ──▶  │  本地服务    │
│  (手机/PC)  │      │  (长连接)     │      │ (Claude CLI) │
└─────────────┘      └──────────────┘      └─────────────┘
       ▲                                            │
       │                                            │
       └──────────────── 实时进度更新 ◀─────────────┘
```

#### 实时进度更新

**核心特性**：消息持续刷新，实时展示 Claude 的执行过程！

| 阶段 | 状态 | 说明 |
|------|------|------|
| 🔄 | 正在处理... | 初始状态，等待响应 |
| 🤔 | THINKING 表情 | Claude 正在思考 |
| 📖/🔧/💻 | 工具调用 | 显示正在使用的工具 |
| ✅ | THUMBSUP 表情 | 任务完成 |
| ❌ | CROSS 表情 | 任务失败或忙碌 |

#### 工具调用可视化

Claude 使用的每个工具都会显示对应的 emoji 和简短描述：

| 工具 | Emoji | 示例 |
|------|-------|------|
| Read | 📖 | 📖 package.json |
| Write | ✏️ | ✏️ src/index.ts |
| Edit | 📝 | 📝 README.md |
| Bash | 💻 | 💻 `npm install` |
| Glob | 🔍 | 🔍 `**/*.ts` |
| Grep | 🔎 | 🔎 "function" |
| WebSearch | 🌐 | 🌐 "搜索内容" |

#### 消息更新机制

1. **初始消息**：发送 "🔄 正在处理..."
2. **流式更新**：每 2 秒更新一次消息内容
3. **工具展示**：显示当前正在执行的工具
4. **最终结果**：完成后显示完整输出

#### 表情反馈说明

| 表情 | 含义 | 触发时机 |
|------|------|----------|
| 🤔 THINKING | 正在处理 | 收到命令后立即添加 |
| ✅ THUMBSUP | 执行成功 | 任务正常完成 |
| ❌ CROSS | 执行失败/忙碌 | 错误或正在处理其他任务 |
| 😠 ANGRY | 系统错误 | 严重的处理错误 |

#### 消息去重机制

- 自动缓存已处理的消息 ID（最多 5000 条）
- 持久化到 `./data/processed_ids.json`
- 防止服务重启后重复处理消息

#### 长连接 vs Webhook

| 模式 | 优势 | 适用场景 |
|------|------|----------|
| **长连接** (默认) | 实时性强，无需公网 IP | 本地服务，推荐使用 |
| Webhook | 需要公网地址 | 云服务器部署 |

本项目默认使用**长连接模式**，无需配置公网地址即可接收飞书消息。

#### 常见问题

**Q: 为什么有时消息不会实时更新？**
A: 飞书限制了单条消息的编辑次数（约 20 次）。超出限制后会自动发送新消息。

**Q: 如何判断任务是否完成？**
A: 查看消息表情：
- 🤔 (思考中) → 正在执行
- ✅ (完成) → 任务成功
- ❌ (错误) → 任务失败

**Q: 支持群聊使用吗？**
A: 支持！在群聊中需要 @ 机器人才能触发响应。

**Q: 多人会话冲突吗？**
A: 不会。每个聊天（私聊/群聊）维护独立的工作目录和会话上下文。

### 基本交互

直接在飞书中给机器人发送消息：

```
读取 package.json 文件并解释其结构
```

群聊中需要 @ 机器人：

```
@Claude 帮我重构这个函数
```

### 命令

| 命令 | 说明 |
|------|------|
| `?` 或 `？` 或 `/help` | 显示帮助卡片（含热门目录、目录列表、Skill 列表按钮） |
| `/clear` 或 `/reset` | 清除当前会话上下文 |
| `/status` | 查看会话状态 |
| `/pwd` | 显示当前工作目录 |
| `/cd <路径>` | 切换工作目录（支持相对路径如 `../`） |
| `/dirs` | 显示工作目录下的项目列表（需配置 `WORKSPACE_DIR`） |
| `/mode <模式>` | 切换权限模式 |
| `/skills` | 显示 Skill 列表卡片 |
| `/tasklist` 或 `/tasks` | 显示当前目录的上下文列表 |
| `/resume <目录>` | 恢复之前的任务 |
| `/taskdelete <目录>` | 删除指定目录的任务记录 |

### CLI 命令

| 命令 | 说明 |
|------|------|
| `claude-client start [dir]` | 启动服务 |
| `claude-client config` | 显示当前配置 |
| `claude-client check` | 检查 Claude Code CLI 是否可用 |
| `claude-client startup install [--dir <path>]` | 安装开机自启 |
| `claude-client startup uninstall` | 卸载开机自启 |

### 权限模式

| 模式 | 说明 |
|------|------|
| `default` | 所有操作需要手动批准 |
| `acceptEdits` | 自动批准文件编辑，其他需批准 |
| `bypassPermissions` | 跳过所有权限检查（谨慎使用） |
| `plan` | 计划模式，用于复杂任务规划 |

### 热门目录

帮助卡片会显示最近访问的 5 个目录，便于快速切换：

```
? → 显示热门目录 → 点击切换
```

### 项目目录列表

配置 `WORKSPACE_DIR` 后，帮助卡片"目录管理"区域会出现"目录列表"按钮，点击后展示该目录下所有子文件夹，一键切换：

```env
# .env
WORKSPACE_DIR=D:\code
```

```
? → 点击"目录列表" → 展示所有子文件夹 → 点击切换
```

- 当前工作目录会高亮显示
- 未配置 `WORKSPACE_DIR` 时，"目录列表"按钮不显示

### 任务管理

- 每个目录维护独立的对话上下文
- 使用 `/tasklist` 查看当前目录的历史上下文
- 一键恢复之前的任务

### Skill 列表

帮助卡片中新增 "Skill 列表" 按钮，点击后展示所有可用的用户自定义 Skill：

- **自动发现**：自动扫描 `~/.claude/skills/`（全局）和项目 `.claude/skills/`（项目级）下的所有 Skill
- **一键复制**：点击 Skill 按钮后，机器人回复纯命令文本，长按即可复制粘贴到输入框使用
- **支持自定义命令**：同时扫描项目 `.claude/commands/` 目录下的自定义命令

```
? → 点击"Skill 列表" → 展示所有 Skill → 点击复制命令
```

### 开机自启

支持 Windows、macOS、Linux 开机自动启动 claude-client，无需手动操作。

#### 安装

```bash
# 当前目录作为工作目录
claude-client startup install

# 指定工作目录
claude-client startup install --dir /path/to/project

# 也可通过独立脚本安装（无需全局安装）
bash scripts/install-startup.sh install /path/to/project
```

#### 卸载

```bash
claude-client startup uninstall

# 或通过独立脚本
bash scripts/install-startup.sh uninstall
```

#### 各平台实现

| 平台 | 实现方式 | 说明 |
|------|----------|------|
| Windows | 启动目录 VBS 脚本 | 可在任务管理器 > 启动中管理 |
| macOS | LaunchAgent plist | 支持 `launchctl` 管理 |
| Linux | systemd user service | 支持 `systemctl --user` 管理 |

> **注意**：Windows 下使用 `cmd /c node` 从 PATH 查找 Node.js，兼容 fnm/nvm 等版本管理器。如切换 Node 大版本后启动异常，请重新执行 `startup install`。

### 终端执行飞书通知 Hook

**功能说明**：在终端直接使用 `claude` 命令时，执行完成后自动发送飞书通知。

#### 安装 Hook

```bash
# 运行安装脚本
npm run hook:install

# 或手动执行
bash scripts/install-hook.sh install
```

#### 配置飞书 Webhook

1. **创建飞书群机器人**：
   - 打开飞书群组
   - 群设置 → 群机器人 → 添加机器人 → 自定义机器人
   - 复制 Webhook URL

2. **配置环境变量**：
   ```bash
   # 临时配置（当前会话有效）
   export FEISHU_WEBHOOK_URL='https://open.feishu.cn/open-apis/bot/v2/hook/xxx'

   # 永久配置（添加到 ~/.bashrc 或 ~/.zshrc）
   echo "export FEISHU_WEBHOOK_URL='你的webhook_url'" >> ~/.bashrc
   source ~/.bashrc
   ```

3. **重新加载 Shell 配置**：
   ```bash
   source ~/.bashrc  # bash
   source ~/.zshrc   # zsh
   ```

#### 使用方式

安装后，直接使用 `claude` 命令即可，**用法完全不变**：

```bash
# 正常使用 claude 命令
claude "帮我写一个快速排序函数"

# 多行输入
claude
# 进入交互模式，输入完成后 Ctrl+D 提交

# 带 --continue 继续
claude --continue "优化一下这个函数"
```

执行完成后会自动发送飞书通知：

```
✅ **Claude 执行成功**

**退出码**: `0`
**命令**: `claude 帮我写一个快速排序函数`
**时间**: 2026-03-07 14:30:25
**目录**: `/Users/xxx/project`
**耗时**: 45 秒
```

#### Hook 管理命令

```bash
# 查看状态
bash scripts/install-hook.sh status

# 卸载 Hook
bash scripts/install-hook.sh uninstall
```

#### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `FEISHU_WEBHOOK_URL` | 飞书群机器人 Webhook URL | 空 |
| `CLAUDE_NOTIFY_ENABLED` | 是否启用通知 | `true` |
| `CLAUDE_CMD` | claude 命令路径 | `claude` |

#### 禁用通知

临时禁用通知：
```bash
CLAUDE_NOTIFY_ENABLED=false claude "这条不通知"
```

## ⚙️ 配置

### 变更记录

在 `data/change-logger-config.json` 中配置：

```json
{
  "enabled": true,
  "type": "git",
  "git": {
    "autoCommit": false,
    "commitMessageTemplate": "feat(claude-client): {userMessage}",
    "includeDiff": true,
    "excludePatterns": ["node_modules", ".git", "dist"]
  }
}
```

支持的记录类型：
- `git` - 使用 Git 记录变更
- `feishu-doc` - 记录到飞书文档
- `console` - 打印到控制台（调试用）
- `none` - 禁用记录

## 📁 项目结构

```
claude-client/
├── src/
│   ├── feishu/              # 飞书集成
│   │   ├── client.ts        # API 客户端
│   │   └── handler.ts       # 事件处理器
│   ├── claude/              # Claude CLI 集成
│   │   └── agent.ts         # Agent 封装
│   ├── session/             # 会话管理
│   │   ├── manager.ts       # 会话管理器
│   │   ├── task-store.ts    # 任务持久化
│   │   └── directory-store.ts # 目录历史
│   ├── change-logger/       # 变更记录系统
│   │   ├── manager.ts       # 记录管理器
│   │   ├── git-logger.ts    # Git 记录器
│   │   └── feishu-doc-logger.ts
│   ├── utils/               # 工具函数
│   │   ├── config.ts        # 配置管理
│   │   ├── logger.ts        # 日志
│   │   ├── formatter.ts     # 消息格式化
│   │   └── workspace.ts     # 工作目录工具
│   ├── startup/             # 开机自启管理
│   │   ├── templates.ts     # 启动脚本模板
│   │   ├── detect.ts        # 路径自动检测
│   │   ├── index.ts         # 统一入口
│   │   └── platforms/       # 平台实现
│   │       ├── windows.ts   # Windows (VBS)
│   │       ├── macos.ts     # macOS (LaunchAgent)
│   │       └── linux.ts     # Linux (systemd)
│   ├── types/               # TypeScript 类型
│   ├── app.ts               # 主应用
│   └── cli.ts               # CLI 入口
├── data/                    # 持久化数据
├── config/                  # 配置文件
└── dist/                    # 编译后的 JavaScript
```

## 🔒 安全注意事项

1. **网络安全** - 不要将服务直接暴露在公网，建议使用 VPN 或内网穿透服务
2. **文件访问** - Claude 可以访问工作目录及其子目录中的文件
3. **API 限制** - 注意 Claude API 的速率限制
4. **会话超时** - 30 分钟无活动后会话过期
5. **权限模式** - 谨慎使用 `bypassPermissions` 模式

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 监听模式
npm run watch

# 运行测试
npm test

# 代码检查
npm run lint
```

## 📚 参考资料

- [Claude Code 文档](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Agent SDK](https://platform.claude.com/docs/agent-sdk/overview)
- [飞书开放平台](https://open.feishu.cn/)
- [Lark API 文档](https://open.larksuite.com/document)

## 🤝 参与贡献

欢迎贡献代码！请随时提交 Pull Request。

## 💬 交流群

欢迎加入交流群，一起讨论 Claude Client 的使用和开发：

![交流群二维码](./imgs/qr-group.jpg)

## 📝 更新日志

### 2026-04-09

- **新增开机自启功能**：支持 Windows、macOS、Linux 三平台开机自动启动 claude-client
  - 新增 `claude-client startup install/uninstall` CLI 子命令
  - Windows 通过启动目录 VBS 脚本实现，可在任务管理器中管理
  - macOS 通过 LaunchAgent plist 实现
  - Linux 通过 systemd user service 实现
  - 新增 `scripts/install-startup.sh` 独立安装脚本
  - 移除旧的硬编码 `start.vbs`，由新方案替代
- **新增 Skill 列表功能**：帮助卡片中新增 "Skill 列表" 按钮，自动发现并展示 `~/.claude/skills/` 和项目 `.claude/skills/`、`.claude/commands/` 下的所有用户自定义 Skill
- **新增 `/skills` 命令**：直接发送 `/skills` 查看 Skill 列表卡片
- **一键复制命令**：点击 Skill 按钮后，机器人回复纯命令文本，长按即可复制粘贴使用

## 📄 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)

---

## 💡 推荐服务

<table>
<tr>
<td>

**[ctok.ai](https://ctok.ai/)** — Claude Code / Codex CLI 拼车

✅ Claude Code &nbsp; ✅ Codex CLI

*热心网友提供的拼车服务*

</td>
</tr>
</table>

---

Made with ❤️ by the Claude Client Team

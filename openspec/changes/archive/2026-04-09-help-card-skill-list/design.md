## Context

当前飞书机器人（claude-client）通过帮助卡片展示基础斜杠命令（`/clear`、`/mode`、`/cd` 等），但缺少对 Claude Code OMC skill 命令的发现入口。用户无法直观了解 `/oh-my-claudecode:autopilot`、`/oh-my-claudecode:plan` 等 skill 命令的存在和用法。

飞书卡片按钮不支持原生"复制到剪贴板"操作。现有按钮回调机制将 `value.command` 转换为等效文本消息，通过 `onMessage` 管道处理。需要在此约束下设计 skill 命令的"复制"体验。

## Goals / Non-Goals

**Goals:**
- 在帮助卡片中增加 "Skill 列表" 入口按钮
- 新增 `/skills` 命令，生成按分类展示的 skill 列表卡片
- 用户点击具体 skill 后，机器人回复包含完整命令模板的文本消息，用户可长按复制后粘贴使用
- Skill 列表易于维护和扩展（数据驱动，静态配置）

**Non-Goals:**
- 不实现动态从 Claude Code 获取 skill 列表（首期使用静态配置）
- 不实现一键复制到剪贴板（飞书不支持）
- 不修改现有按钮回调机制的核心逻辑

## Decisions

### 1. Skill 数据结构：静态配置数组

**选择**: 在 `formatter.ts` 中定义 `SKILL_CATEGORIES` 常量数组，按分类组织 skill。

**替代方案**: 从外部 JSON/YAML 文件加载 — 增加文件 I/O 和配置管理复杂度，首期不必要。

**理由**: Skill 列表相对稳定，与卡片生成逻辑同文件维护最简单。未来需要动态化时再重构为外部配置。

### 2. "复制命令"交互方式：skill-copy 回复文本

**选择**: 每个技能按钮的 `value.command` 设为 `/skill-copy <skill-name>`。`detectSpecialCommand` 识别该前缀，`handleSpecialCommand` 中的 `skill-copy` case 向用户发送包含命令模板的文本消息。

**交互流程**:
1. 用户点击 skill 按钮（如 "autopilot"）
2. 回调触发，`content = '/skill-copy autopilot'`
3. `detectSpecialCommand` 返回 `{ type: 'skill-copy', args: 'autopilot' }`
4. `handleSpecialCommand` 匹配 `skill-copy`，查找 skill 元数据，发送文本消息：
   ```
   📋 命令模板：
   /oh-my-claudecode:autopilot <你的任务描述>

   长按命令复制，粘贴到输入框后替换 <你的任务描述> 即可使用
   ```
5. 用户在飞书中长按该文本消息复制命令，粘贴到输入框并修改

**替代方案**: 直接执行 skill 命令 — 但用户需要附加任务描述，直接执行不合适。

**理由**: 用户需要修改命令模板（添加任务描述），文本消息是飞书中唯一可长按复制的载体。

### 3. 帮助卡片新增按钮位置

**选择**: 在"权限模式"区块之后、"提示"区块之前新增 "Skill 列表" 按钮。

**理由**: Skill 属于高级功能，放在基础命令之后符合使用频率递减的排列逻辑。

## Risks / Trade-offs

- **[飞书长按复制体验]** 飞书中长按文本复制不如原生剪贴板便捷 → 在回复文本中明确提示操作方式，降低用户困惑
- **[Skill 列表维护]** 静态配置需要手动更新 → 将数据集中定义，注释清晰，未来可改为动态加载
- **[卡片按钮数量限制]** 飞书对单个 action 的按钮数量有限制（约 4-5 个）→ 每个 skill 单独一个 action 元素（一行一个），避免触发限制

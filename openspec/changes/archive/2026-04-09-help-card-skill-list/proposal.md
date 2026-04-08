## Why

用户通过飞书机器人使用 Claude Code 时，无法直观发现和了解可用的 skill 命令（如 `/oh-my-claudecode:autopilot`、`/oh-my-claudecode:plan` 等）。当前帮助卡片只展示了基础斜杠命令（`/clear`、`/mode` 等），缺少 skill 发现入口。用户需要一种便捷的方式来浏览 skill 列表，并快速复制 skill 命令到输入框使用。

## What Changes

- 在帮助卡片中新增 "Skill 列表" 按钮，点击后展示 skill 列表卡片
- 新增 `/skills` 命令，可直接触发 skill 列表卡片
- 创建 `generateSkillListCard()` 函数，按分类展示所有可用 skill
- 每个 skill 展示名称和简要描述，点击后机器人回复一条包含完整命令的文本消息，用户可长按复制后粘贴使用
- 在回调处理器中支持新的按钮 action 类型 `skill-copy`，用于区分"执行命令"和"展示可复制命令"

## Capabilities

### New Capabilities

- `skill-list-card`: skill 列表卡片的生成与交互，包含分类展示、命令复制回复

### Modified Capabilities

## Impact

- `src/utils/formatter.ts`: 新增 `generateSkillListCard()` 函数，修改 `generateHelpCard()` 添加 skill 按钮
- `src/utils/formatter.ts`: `detectSpecialCommand()` 新增 `/skills` 命令识别
- `src/app.ts`: `handleSpecialCommand()` 新增 `skills` case 和 `skill-copy` case
- `src/feishu/handler.ts`: `handleCardAction()` 支持处理 `skill-copy` 类型按钮回调

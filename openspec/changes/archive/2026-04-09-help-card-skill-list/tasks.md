## 1. 数据定义

- [x] 1.1 在 `src/utils/formatter.ts` 中定义 `Skill` 接口（`id`, `name`, `command`, `description`）和 `SkillCategory` 接口（`name`, `skills`）
- [x] 1.2 定义 `SKILL_CATEGORIES` 常量数组，按分类组织所有 skill（工作流、代码质量、调试分析、多模型协作等），每个 skill 包含 `id`、`name`、`command`、`description`

## 2. 命令识别

- [x] 2.1 在 `detectSpecialCommand()` 中添加 `/skills` 命令识别，返回 `{ type: 'skills', args: '' }`
- [x] 2.2 在 `detectSpecialCommand()` 中添加 `/skill-copy` 前缀识别，返回 `{ type: 'skill-copy', args: '<skill-id>' }`

## 3. 卡片生成

- [x] 3.1 实现 `generateSkillListCard()` 函数：按分类遍历 `SKILL_CATEGORIES`，生成包含分类标题（`lark_md` div）和 skill 按钮（`action` 元素）的卡片，每个按钮 `value.command` 为 `/skill-copy <skill-id>`
- [x] 3.2 在 skill 列表卡片末尾添加 "返回帮助" 按钮，`value.command` 为 `/help`
- [x] 3.3 在 `generateHelpCard()` 中，在权限模式区块之后、提示区块之前，新增 "Skill 列表" 按钮区块，按钮 `value.command` 为 `/skills`

## 4. 命令处理

- [x] 4.1 在 `handleSpecialCommand()` 中添加 `skills` case：调用 `generateSkillListCard()` 并通过 `sendCardMessage` 发送
- [x] 4.2 在 `handleSpecialCommand()` 中添加 `skill-copy` case：根据 `args` 查找 `SKILL_CATEGORIES` 中的 skill，找到则发送包含命令模板和用法提示的文本消息，未找到则发送错误提示

## 5. 导出与集成

- [x] 5.1 确保 `generateSkillListCard` 和 `SKILL_CATEGORIES` 在 `formatter.ts` 中正确导出
- [x] 5.2 在 `app.ts` 中导入新增的函数，确认 `/skills` 和 `/skill-copy` 命令完整可用

## Why

当前用户通过飞书切换工作目录只能使用 `/cd <path>` 命令手动输入完整路径，或依赖"最近访问目录"列表。对于在固定工作目录（如 `D:\code`）下管理多个项目的用户，缺少一个快速浏览和切换子目录的方式。增加工作目录配置后，用户可以一键查看所有项目并快速切换。

## What Changes

- 新增环境变量 `WORKSPACE_DIR` 配置项，指定工作目录根路径
- 启动时读取该目录下的子文件夹列表
- Help 卡片增加"目录列表"按钮，点击后发送项目目录列表卡片
- 目录列表卡片样式与 Help 卡片风格一致，每个子目录为一个可点击按钮
- 点击子目录按钮等同于执行 `/cd <path>`，快速切换工作目录

## Capabilities

### New Capabilities
- `workspace-dir-config`: 工作目录根路径的配置、读取与子文件夹列表获取
- `directory-list-card`: 目录列表飞书交互卡片的生成与交互处理

### Modified Capabilities
<!-- 无现有 specs 需要修改 -->

## Impact

- **配置文件**: `src/utils/config.ts` 新增 `WORKSPACE_DIR` 环境变量解析
- **卡片生成**: `src/utils/formatter.ts` 新增 `generateDirectoryListCard()` 函数
- **命令处理**: `src/app.ts` 的 help 分支增加目录列表按钮，新增目录列表卡片 action 处理
- **卡片交互**: `src/feishu/handler.ts` 可能需要处理新的 card action value
- **.env**: 新增 `WORKSPACE_DIR` 环境变量文档说明

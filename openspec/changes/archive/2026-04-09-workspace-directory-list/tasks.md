## 1. 配置层

- [x] 1.1 在 `src/utils/config.ts` 的 `AppConfig` 类型中新增可选字段 `workspaceDir?: string`
- [x] 1.2 在 `getConfig()` 中解析 `WORKSPACE_DIR` 环境变量，使用 `path.resolve()` 转换为绝对路径

## 2. 子文件夹读取工具

- [x] 2.1 在 `src/utils/` 中新增 `workspace.ts`，实现 `getSubDirectories(workspaceDir: string): string[]` 函数，读取一级子文件夹并按字母排序，返回全部

## 3. 目录列表卡片生成

- [x] 3.1 在 `src/utils/formatter.ts` 中新增 `generateDirectoryListCard(directories: string[], currentDir?: string)` 函数，生成飞书交互卡片，风格与 Help 卡片一致
- [x] 3.2 每个子文件夹生成一个按钮，按钮 value 为 `{ command: "/cd <绝对路径>" }`
- [x] 3.3 当前工作目录对应的按钮使用 `primary` 类型高亮
- [x] 3.4 卡片底部添加"返回帮助"按钮，value 为 `{ command: "/help" }`

## 4. Help 卡片更新

- [x] 4.1 修改 `generateHelpCard()` 函数签名，接受 `workspaceDir?: string` 参数
- [x] 4.2 当 `workspaceDir` 存在时，在目录管理区域增加"目录列表"按钮，value 为 `{ command: "/dirs" }`
- [x] 4.3 当 `workspaceDir` 不存在时，不显示该按钮

## 5. 命令处理集成

- [x] 5.1 在 `src/app.ts` 的 `handleMessage` 中注册新的特殊命令 `/dirs`（在 `detectSpecialCommand` 中添加）
- [x] 5.2 在 `app.ts` 的命令 switch 中新增 `dirs` case：读取子文件夹列表，生成并发送目录列表卡片
- [x] 5.3 当无子文件夹时发送文本提示"工作目录下没有子文件夹"
- [x] 5.4 当 `workspaceDir` 未配置时发送文本提示"未配置工作目录"
- [x] 5.5 更新 help case 调用 `generateHelpCard` 时传入 `workspaceDir` 参数

## 6. 验证

- [x] 6.1 配置 `WORKSPACE_DIR` 后启动，发送 `/help` 确认"目录列表"按钮出现
- [x] 6.2 点击"目录列表"按钮，确认卡片正确展示子文件夹
- [x] 6.3 点击子文件夹按钮，确认目录切换成功
- [x] 6.4 确认当前目录按钮高亮显示
- [x] 6.5 不配置 `WORKSPACE_DIR` 时，确认 Help 卡片无"目录列表"按钮

## ADDED Requirements

### Requirement: Help 卡片增加目录列表入口按钮
Help 卡片 SHALL 在"目录管理"区域增加一个"目录列表"按钮（仅当 `WORKSPACE_DIR` 已配置时显示）。

#### Scenario: WORKSPACE_DIR 已配置
- **WHEN** 用户发送 `?` 或 `/help` 且 `WORKSPACE_DIR` 已配置
- **THEN** Help 卡片中显示"目录列表"按钮，点击后触发发送目录列表卡片

#### Scenario: WORKSPACE_DIR 未配置
- **WHEN** 用户发送 `?` 或 `/help` 且 `WORKSPACE_DIR` 未配置
- **THEN** Help 卡片不显示"目录列表"按钮，其他功能不受影响

### Requirement: 目录列表卡片生成
系统 SHALL 生成一张飞书交互卡片，展示 `WORKSPACE_DIR` 下的所有子文件夹作为可点击按钮。

#### Scenario: 有子文件夹
- **WHEN** 用户触发目录列表请求且工作目录下有子文件夹
- **THEN** 系统发送一张卡片，标题为"项目目录列表"，每个子文件夹为一个按钮，按钮文字为文件夹名称，按钮 value 为 `{ command: "/cd <绝对路径>" }`
- **THEN** 卡片风格与 Help 卡片一致（使用相同的配色、字体大小、按钮样式）
- **THEN** 当前工作目录对应的按钮 SHALL 使用 `primary` 类型高亮显示
- **THEN** 卡片底部显示"返回帮助"按钮

#### Scenario: 无子文件夹
- **WHEN** 用户触发目录列表请求且工作目录下无子文件夹
- **THEN** 系统发送文本消息提示"工作目录下没有子文件夹"

#### Scenario: 点击子目录按钮
- **WHEN** 用户点击目录列表卡片中的某个子文件夹按钮
- **THEN** 系统执行 `/cd <对应路径>` 命令，切换工作目录到该子文件夹

#### Scenario: 点击返回帮助按钮
- **WHEN** 用户点击目录列表卡片中的"返回帮助"按钮
- **THEN** 系统发送 Help 卡片

## ADDED Requirements

### Requirement: WORKSPACE_DIR 环境变量配置
系统 SHALL 支持通过 `WORKSPACE_DIR` 环境变量配置工作目录根路径。该路径用于读取子文件夹列表供用户快速切换目录。

#### Scenario: 正常配置
- **WHEN** `.env` 中设置了有效的 `WORKSPACE_DIR` 值（如 `D:\code`）
- **THEN** 系统启动时解析该路径并存入 `AppConfig.workspaceDir`，该值为绝对路径字符串

#### Scenario: 未配置
- **WHEN** `.env` 中未设置 `WORKSPACE_DIR`
- **THEN** `AppConfig.workspaceDir` 为 `undefined`，相关功能静默禁用

#### Scenario: 配置了相对路径
- **WHEN** `WORKSPACE_DIR` 设置为相对路径（如 `./projects`）
- **THEN** 系统 SHALL 使用 `path.resolve()` 将其转换为绝对路径

### Requirement: 读取子文件夹列表
系统 SHALL 能够读取 `WORKSPACE_DIR` 下的所有一级子文件夹（不包含文件，不递归）。

#### Scenario: 目录下有子文件夹
- **WHEN** 调用读取函数并传入有效的工作目录路径
- **THEN** 返回该目录下所有一级子文件夹的绝对路径数组，按字母顺序排序

#### Scenario: 目录下有文件和文件夹混合
- **WHEN** 工作目录下同时包含文件和文件夹
- **THEN** 仅返回文件夹路径，忽略文件

#### Scenario: 目录不存在
- **WHEN** `WORKSPACE_DIR` 指向的路径不存在
- **THEN** 返回空数组

#### Scenario: 目录下子文件夹数量较多
- **WHEN** 工作目录下的子文件夹数量较多
- **THEN** 返回全部子文件夹，按字母顺序排序

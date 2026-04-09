@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo.
echo ======================================
echo   Claude Client - 启动中...
echo ======================================
echo.

:: 检查 Node.js 是否可用
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查是否已构建
if not exist "dist\cli.js" (
    echo [提示] 未检测到构建产物，正在构建...
    call npm run build
    if %errorlevel% neq 0 (
        echo [错误] 构建失败，请检查代码
        pause
        exit /b 1
    )
    echo.
)

:: 启动服务
node dist\cli.js start

:: 如果服务异常退出，暂停以便查看错误信息
if %errorlevel% neq 0 (
    echo.
    echo [错误] 服务异常退出，退出码: %errorlevel%
    pause
)

@echo off
echo Launching Microsoft Edge in debug mode...
echo Port: 9222
echo Debug profile location: %~dp0edge-debug-profile

REM Create debug profile directory if it doesn't exist
if not exist "%~dp0edge-debug-profile" (
    mkdir "%~dp0edge-debug-profile"
    echo Created debug profile directory
)

REM Try to find Edge executable
set EDGE_PATH="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist %EDGE_PATH% (
    set EDGE_PATH="%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
)

if exist %EDGE_PATH% (
    echo Starting Edge from: %EDGE_PATH%
    start "" %EDGE_PATH% --remote-debugging-port=9222 --user-data-dir="%~dp0edge-debug-profile" --disable-web-security --disable-features=VizDisplayCompositor http://localhost:3000
    echo Edge launched successfully!
    echo You can now attach VS Code debugger using 'Attach to Edge' configuration
) else (
    echo Microsoft Edge not found at expected locations!
    echo Please check your Edge installation.
)

pause

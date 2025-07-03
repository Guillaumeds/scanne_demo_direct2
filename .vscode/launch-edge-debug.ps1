# PowerShell script to launch Microsoft Edge in debug mode
# This allows VS Code to attach and view console logs

Write-Host "Launching Microsoft Edge in debug mode..." -ForegroundColor Green
Write-Host "Port: 9222" -ForegroundColor Yellow
Write-Host "Debug profile location: $PSScriptRoot\edge-debug-profile" -ForegroundColor Yellow

# Create debug profile directory if it doesn't exist
$debugProfilePath = Join-Path $PSScriptRoot "edge-debug-profile"
if (-not (Test-Path $debugProfilePath)) {
    New-Item -ItemType Directory -Path $debugProfilePath -Force | Out-Null
    Write-Host "Created debug profile directory: $debugProfilePath" -ForegroundColor Cyan
}

# Launch Edge with remote debugging enabled
$edgePath = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe"
}

if (Test-Path $edgePath) {
    Write-Host "Starting Edge from: $edgePath" -ForegroundColor Cyan
    Start-Process -FilePath $edgePath -ArgumentList @(
        "--remote-debugging-port=9222",
        "--user-data-dir=`"$debugProfilePath`"",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "http://localhost:3000"
    )
    Write-Host "Edge launched successfully!" -ForegroundColor Green
    Write-Host "You can now attach VS Code debugger using 'Attach to Edge' configuration" -ForegroundColor Yellow
} else {
    Write-Host "Microsoft Edge not found at expected locations!" -ForegroundColor Red
    Write-Host "Please check your Edge installation or modify the script with the correct path." -ForegroundColor Red
}

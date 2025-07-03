# PowerShell script to test Edge debug connection and demonstrate console integration

Write-Host "Testing Edge Debug Integration" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Test if Edge debug port is accessible
Write-Host ""
Write-Host "1. Testing debug port accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9222/json" -TimeoutSec 5
    Write-Host "Debug port 9222 is accessible" -ForegroundColor Green
    Write-Host "Found $($response.Count) debug targets" -ForegroundColor Cyan

    # Find the Scanne page
    $scannePage = $response | Where-Object { $_.type -eq "page" -and ($_.title -eq "Scanne" -or $_.url -like "*localhost:3000*") }

    if ($scannePage) {
        Write-Host "Found Scanne app page:" -ForegroundColor Green
        Write-Host "   Title: $($scannePage.title)" -ForegroundColor White
        Write-Host "   URL: $($scannePage.url)" -ForegroundColor White
        Write-Host "   WebSocket: $($scannePage.webSocketDebuggerUrl)" -ForegroundColor White
    } else {
        Write-Host "Scanne page not found. Available pages:" -ForegroundColor Red
        $response | Where-Object { $_.type -eq "page" } | ForEach-Object {
            Write-Host "   - $($_.title) ($($_.url))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Cannot connect to debug port 9222" -ForegroundColor Red
    Write-Host "   Make sure Edge is running with --remote-debugging-port=9222" -ForegroundColor Yellow
    exit 1
}

# Test VS Code debugger configuration
Write-Host ""
Write-Host "2. Testing VS Code debugger configuration..." -ForegroundColor Yellow
$launchJsonPath = ".vscode/launch.json"
if (Test-Path $launchJsonPath) {
    Write-Host "VS Code launch.json exists" -ForegroundColor Green
    $launchConfig = Get-Content $launchJsonPath | ConvertFrom-Json
    $edgeConfig = $launchConfig.configurations | Where-Object { $_.name -eq "Attach to Edge" }
    if ($edgeConfig) {
        Write-Host "Attach to Edge configuration found" -ForegroundColor Green
        Write-Host "   Port: $($edgeConfig.port)" -ForegroundColor White
        Write-Host "   Type: $($edgeConfig.type)" -ForegroundColor White
    } else {
        Write-Host "Attach to Edge configuration not found" -ForegroundColor Red
    }
} else {
    Write-Host "VS Code launch.json not found" -ForegroundColor Red
}

# Instructions for manual testing
Write-Host ""
Write-Host "3. Manual Testing Instructions:" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow
Write-Host "To test the console integration manually:" -ForegroundColor White
Write-Host ""
Write-Host "Step 1: In VS Code" -ForegroundColor Cyan
Write-Host "   - Press Ctrl+Shift+D (Run and Debug)" -ForegroundColor White
Write-Host "   - Select Attach to Edge from dropdown" -ForegroundColor White
Write-Host "   - Press F5 to attach" -ForegroundColor White
Write-Host ""
Write-Host "Step 2: Open Edge DevTools in VS Code" -ForegroundColor Cyan
Write-Host "   - Press Ctrl+Shift+P" -ForegroundColor White
Write-Host "   - Type Microsoft Edge Tools: Open DevTools" -ForegroundColor White
Write-Host "   - Click on Console tab" -ForegroundColor White
Write-Host ""
Write-Host "Step 3: Test Console Integration" -ForegroundColor Cyan
Write-Host "   - In the Edge browser, press F12" -ForegroundColor White
Write-Host "   - In browser console, type: console.log('Hello from Edge!')" -ForegroundColor White
Write-Host "   - Check if message appears in VS Code Edge DevTools Console" -ForegroundColor White
Write-Host ""
Write-Host "Step 4: Test from VS Code" -ForegroundColor Cyan
Write-Host "   - In VS Code Edge DevTools Console, type: console.log('Hello from VS Code!')" -ForegroundColor White
Write-Host "   - Check if message appears in browser console" -ForegroundColor White

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Follow the manual testing steps above" -ForegroundColor White
Write-Host "2. If successful, you will see console logs in both places" -ForegroundColor White
Write-Host "3. Your debugging workflow is ready!" -ForegroundColor White

Write-Host ""
Write-Host "Pro Tips:" -ForegroundColor Magenta
Write-Host "- Use breakpoints in VS Code for your TypeScript/React code" -ForegroundColor White
Write-Host "- Console logs from your app will appear in VS Code automatically" -ForegroundColor White
Write-Host "- Network requests can be monitored in the Network tab" -ForegroundColor White
Write-Host "- DOM inspection available in Elements tab" -ForegroundColor White

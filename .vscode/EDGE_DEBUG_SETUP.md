# Microsoft Edge DevTools Integration with VS Code

This setup allows you to view Microsoft Edge browser console outputs directly in VS Code, making debugging much easier.

## What's Been Set Up

✅ **Microsoft Edge DevTools Extension**: Already installed  
✅ **VS Code Launch Configuration**: Created in `.vscode/launch.json`  
✅ **PowerShell Launch Script**: Created in `.vscode/launch-edge-debug.ps1`  
✅ **Batch Launch Script**: Created in `.vscode/launch-edge-debug.bat`  
✅ **VS Code Tasks**: Created in `.vscode/tasks.json`  

## How to Use

### Method 1: Using VS Code Tasks (Recommended)
1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "Tasks: Run Task" and select it
3. Choose one of these tasks:
   - **"Launch Edge Debug Mode"** - Just launches Edge in debug mode
   - **"Start Next.js Dev Server"** - Starts your development server
   - **"Start Dev Server + Launch Edge Debug"** - Does both sequentially

### Method 2: Manual Steps
1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Launch Edge in debug mode** using one of these options:
   - Double-click `.vscode/launch-edge-debug.bat`
   - Or run in PowerShell: `.vscode/launch-edge-debug.ps1`
   - Or manually: `msedge.exe --remote-debugging-port=9222 --user-data-dir=".vscode/edge-debug-profile" http://localhost:3000`

3. **Attach VS Code debugger**:
   - Press `F5` or go to Run and Debug panel
   - Select "Attach to Edge" configuration
   - Click the green play button

### Method 3: Direct Launch from VS Code
1. Go to Run and Debug panel (`Ctrl+Shift+D`)
2. Select "Launch Edge with debugging" from dropdown
3. Press `F5` - this will launch Edge and attach automatically

## Viewing Console Logs

Once attached, you have several ways to view console logs:

### Option 1: Edge DevTools Panel in VS Code
1. After attaching, look for "Microsoft Edge Tools" panel in VS Code
2. Click on the "Console" tab within that panel
3. All browser console logs will appear here in real-time

### Option 2: VS Code Debug Console
1. Open the Debug Console panel in VS Code
2. Some console output will appear here as well

### Option 3: Browser Elements Panel
1. The Edge DevTools panel also includes Elements, Network, Sources tabs
2. Full debugging capabilities available within VS Code

## Features Available

- **Live Console Logs**: See all `console.log()`, errors, warnings in real-time
- **Interactive Console**: Execute JavaScript directly in the browser context
- **Source Maps**: Debug TypeScript/React code with proper source mapping
- **Network Monitoring**: View API calls and responses
- **Element Inspection**: Inspect DOM elements
- **Breakpoint Debugging**: Set breakpoints in your source code

## Troubleshooting

### Edge Won't Launch
- Check if Edge is installed in standard locations
- Modify the script paths if Edge is installed elsewhere
- Ensure port 9222 isn't already in use

### VS Code Won't Attach
- Make sure Edge was launched with `--remote-debugging-port=9222`
- Check that your dev server is running on `http://localhost:3000`
- Try refreshing the browser page after attaching

### Console Logs Not Showing
- Make sure you're looking in the right panel (Edge DevTools Console)
- Try refreshing the browser page
- Check that the page has actually loaded and is running JavaScript

## Next Steps

1. Start your development server: `npm run dev`
2. Use VS Code Task: "Start Dev Server + Launch Edge Debug"
3. Go to Run and Debug panel and select "Attach to Edge"
4. Press F5 to attach
5. Open the Microsoft Edge Tools panel to see console logs

Your browser console logs will now appear directly in VS Code! 🎉

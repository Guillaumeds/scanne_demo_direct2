# Browser Tools MCP Setup Guide

## 🎯 **Overview**

The Browser Tools MCP integration allows Augment Code to:
- See browser console logs and errors
- Take screenshots of your browser
- Monitor network requests
- Analyze DOM elements
- Run accessibility, performance, and SEO audits

## 🏗️ **Architecture**

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌─────────────┐
│ Augment Code│ ──► │  MCP Server  │ ──► │  Node Server  │ ──► │   Chrome    │
│             │ ◄── │  (Protocol   │ ◄── │ (Middleware)  │ ◄── │  Extension  │
│             │     │   Handler)   │     │               │     │             │
└─────────────┘     └──────────────┘     └───────────────┘     └─────────────┘
```

## 📦 **Components**

### 1. Chrome Extension ✅ (Already Installed)
- Location: `BrowserTools-Extension-Fresh/chrome-extension/`
- Captures console logs, network requests, screenshots
- Connects to Node server on port 3025

### 2. Node.js Middleware Server ⚡ (Run Separately)
- Package: `@agentdeskai/browser-tools-server`
- Port: 3025
- Acts as HTTP bridge between Chrome extension and MCP server

### 3. MCP Server ✅ (Already Configured)
- Package: `@agentdeskai/browser-tools-mcp`
- Protocol: stdio
- Configured in `.vscode/mcp.json`

## 🚀 **Quick Start**

### Option 1: Using npm scripts (Recommended)
```bash
# Start both Next.js dev server and browser tools
npm run dev:with-browser-tools

# Or start browser tools server separately
npm run browser-tools
```

### Option 2: Using VS Code Tasks
1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Choose:
   - **"Start Browser Tools Server"** - Just the browser tools
   - **"Start Dev + Browser Tools"** - Both dev server and browser tools

### Option 3: Manual Command
```bash
npx @agentdeskai/browser-tools-server@latest
```

## ✅ **Verification Steps**

1. **Check Node Server is Running**:
   ```bash
   curl http://localhost:3025/.identity
   ```
   Should return: `{"signature":"mcp-browser-connector-24x7"}`

2. **Check Chrome Extension**:
   - Open Chrome DevTools
   - Look for "BrowserToolsMCP" panel
   - Should show "Connected" status

3. **Test in Augment Code**:
   - Ask: "Can you see my browser console logs?"
   - Ask: "Take a screenshot of my current browser tab"
   - Ask: "Run an accessibility audit on this page"

## 🛠️ **Available Commands**

### npm Scripts
- `npm run browser-tools` - Start browser tools server
- `npm run dev:with-browser-tools` - Start both dev server and browser tools

### VS Code Tasks
- "Start Browser Tools Server"
- "Start Dev + Browser Tools"

## 🔧 **Configuration Files**

### `.vscode/mcp.json` (MCP Server Config)
```json
{
  "servers": {
    "browser-tools": {
      "type": "stdio",
      "command": "npx",
      "args": ["@agentdeskai/browser-tools-mcp@1.2.0"]
    }
  }
}
```

### `package.json` (npm Scripts)
```json
{
  "scripts": {
    "browser-tools": "npx @agentdeskai/browser-tools-server@latest",
    "dev:with-browser-tools": "concurrently \"npm run dev\" \"npm run browser-tools\""
  }
}
```

## 🐛 **Troubleshooting**

### Chrome Extension Not Connecting
1. Restart Chrome completely (not just the window)
2. Restart the Node server: `npm run browser-tools`
3. Only have ONE DevTools panel open
4. Check port 3025 isn't blocked by firewall

### MCP Server Not Working
1. Check Augment Code MCP configuration in settings
2. Restart Augment Code
3. Check MCP server logs in Augment Code

### Port Conflicts
```bash
# Check what's using port 3025
netstat -an | findstr :3025

# Kill process if needed
taskkill /PID <process_id> /F
```

### VS Code MCP Server (Removed)
The VS Code MCP server has been removed to avoid redundancy with Augment Code's native capabilities:
- ✅ Removed `vscode-mcp-server` settings from `.vscode/settings.json`
- ✅ No VS Code MCP extensions installed
- ✅ Clean separation between Augment Code MCP servers and VS Code functionality

## 💡 **Usage Examples**

Once everything is running, you can ask Augment Code:

- "Check my browser console for errors"
- "Take a screenshot of the current page"
- "What network requests failed?"
- "Run a performance audit on this page"
- "Check accessibility issues on this form"
- "Analyze the DOM structure of this component"

## 📚 **Resources**

- [Official GitHub Repository](https://github.com/AgentDeskAI/browser-tools-mcp)
- [Installation Documentation](https://browsertools.agentdesk.ai/)
- [MCP Protocol Documentation](https://docs.anthropic.com/en/docs/build-with-claude/model-context-protocol)

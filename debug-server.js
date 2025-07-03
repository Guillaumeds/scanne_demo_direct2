const WebSocket = require('ws');

// Try different ports if 8081 is in use
const ports = [8081, 8082, 8083, 8084];
let wss = null;
let serverPort = null;

async function startServer() {
  for (const port of ports) {
    try {
      wss = new WebSocket.Server({ port });

      // Handle server errors
      wss.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`⚠️ Port ${port} is in use, trying next port...`);
          return;
        }
        console.error('❌ WebSocket server error:', error);
      });

      serverPort = port;
      console.log(`🚀 Debug Console WebSocket Server started on ws://localhost:${port}`);
      console.log('📡 Streaming browser console logs to terminal...');
      console.log('💡 This runs automatically with "npm run dev"\n');

      setupWebSocketHandlers();
      return;

    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} is in use, trying next port...`);
        continue;
      } else {
        console.error(`❌ Error starting server on port ${port}:`, error);
        continue;
      }
    }
  }
  console.error('❌ Could not find an available port for debug server');
  process.exit(1);
}

function setupWebSocketHandlers() {

  wss.on('connection', function connection(ws) {
    console.log('🔗 Browser connected to debug server');

    ws.on('message', function incoming(data) {
      try {
        const logData = JSON.parse(data);

        // Format the log message with timestamp
        const timestamp = new Date().toLocaleTimeString();
        const level = logData.level.toUpperCase();
        const emoji = getLogEmoji(logData.level);

        // Print to terminal with formatting
        console.log(`[${timestamp}] ${emoji} ${level}: ${logData.message}`);

        // If there are additional arguments, print them
        if (logData.args && logData.args.length > 0) {
          logData.args.forEach(arg => {
            console.log(`    └─ ${JSON.stringify(arg, null, 2)}`);
          });
        }

      } catch (error) {
        console.error('❌ Error parsing log data:', error);
      }
    });

    ws.on('close', function() {
      console.log('🔌 Browser disconnected from debug server');
    });

    ws.on('error', function(error) {
      console.error('❌ WebSocket error:', error);
    });
  });
}

function getLogEmoji(level) {
  switch (level) {
    case 'log': return '📝';
    case 'info': return 'ℹ️';
    case 'warn': return '⚠️';
    case 'error': return '❌';
    case 'debug': return '🐛';
    default: return '📄';
  }
}

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down debug server...');
  if (wss) {
    wss.close(() => {
      console.log('✅ Debug server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start the server
startServer();

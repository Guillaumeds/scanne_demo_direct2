// Debug Console WebSocket Client
(function() {
  let ws = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const ports = [8081, 8082, 8083, 8084];
  let currentPortIndex = 0;

  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };

  function connectWebSocket() {
    const port = ports[currentPortIndex];
    try {
      ws = new WebSocket(`ws://localhost:${port}`);
      
      ws.onopen = function() {
        console.log(`🔗 Connected to debug server on port ${port}`);
        reconnectAttempts = 0;
        currentPortIndex = 0; // Reset to first port for next connection
      };

      ws.onclose = function() {
        console.log('🔌 Disconnected from debug server');

        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
          setTimeout(connectWebSocket, 2000);
        }
      };

      ws.onerror = function(error) {
        console.log(`❌ Debug server connection error on port ${port}:`, error);

        // Try next port
        currentPortIndex++;
        if (currentPortIndex < ports.length) {
          console.log(`🔄 Trying next port: ${ports[currentPortIndex]}`);
          setTimeout(connectWebSocket, 500);
        } else {
          console.log('❌ All debug server ports failed');
          currentPortIndex = 0; // Reset for next attempt
        }
      };
      
    } catch (error) {
      console.log('❌ Failed to connect to debug server:', error);
    }
  }

  function sendToDebugServer(level, message, args) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        const logData = {
          level: level,
          message: message,
          args: args,
          timestamp: new Date().toISOString(),
          url: window.location.href
        };
        
        ws.send(JSON.stringify(logData));
      } catch (error) {
        // Silently fail to avoid infinite loops
      }
    }
  }

  function interceptConsole(level) {
    console[level] = function(...args) {
      // Call original console method
      originalConsole[level].apply(console, args);
      
      // Convert arguments to strings for transmission
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      // Send to debug server
      sendToDebugServer(level, message, args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.parse(JSON.stringify(arg));
          } catch (e) {
            return String(arg);
          }
        }
        return arg;
      }));
    };
  }

  // Intercept all console methods
  ['log', 'info', 'warn', 'error', 'debug'].forEach(interceptConsole);

  // Connect to WebSocket server
  connectWebSocket();

  // Add to window for debugging
  window.debugClient = {
    reconnect: connectWebSocket,
    status: () => ws ? ws.readyState : 'Not connected'
  };

})();

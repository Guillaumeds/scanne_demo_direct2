// Test script to verify Edge console integration with VS Code
const WebSocket = require('ws');

// Get the debug targets from Edge
async function getDebugTargets() {
    try {
        const response = await fetch('http://localhost:9222/json');
        const targets = await response.json();
        return targets;
    } catch (error) {
        console.log('Error getting debug targets:', error.message);
        return [];
    }
}

// Connect to the WebSocket debugger for a specific page
function connectToDebugger(webSocketUrl) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(webSocketUrl);
        
        ws.on('open', () => {
            console.log('✅ Connected to Edge debugger');
            
            // Enable Runtime domain to receive console messages
            ws.send(JSON.stringify({
                id: 1,
                method: 'Runtime.enable'
            }));
            
            // Enable Console domain
            ws.send(JSON.stringify({
                id: 2,
                method: 'Console.enable'
            }));
            
            resolve(ws);
        });
        
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                
                // Handle console messages
                if (message.method === 'Runtime.consoleAPICalled') {
                    const { type, args, timestamp } = message.params;
                    const logArgs = args.map(arg => arg.value || arg.description || '[Object]').join(' ');
                    console.log(`🔍 [${type.toUpperCase()}] ${logArgs}`);
                }
                
                // Handle console messages from Console domain
                if (message.method === 'Console.messageAdded') {
                    const { level, text, timestamp } = message.params.message;
                    console.log(`📝 [${level.toUpperCase()}] ${text}`);
                }
                
                // Handle responses to our enable commands
                if (message.id === 1 || message.id === 2) {
                    console.log(`✅ Enabled domain for message ID ${message.id}`);
                }
            } catch (error) {
                console.log('Error parsing message:', error.message);
            }
        });
        
        ws.on('error', (error) => {
            console.log('❌ WebSocket error:', error.message);
            reject(error);
        });
        
        ws.on('close', () => {
            console.log('🔌 WebSocket connection closed');
        });
    });
}

// Test the console integration
async function testConsoleIntegration() {
    console.log('🚀 Testing Edge console integration...');
    
    const targets = await getDebugTargets();
    console.log(`📋 Found ${targets.length} debug targets`);
    
    // Find the Scanne app page
    const scannePage = targets.find(target => 
        target.type === 'page' && 
        (target.title === 'Scanne' || target.url.includes('localhost:3000'))
    );
    
    if (!scannePage) {
        console.log('❌ Could not find Scanne app page');
        console.log('Available targets:');
        targets.forEach(target => {
            console.log(`  - ${target.title} (${target.type}) - ${target.url}`);
        });
        return;
    }
    
    console.log(`✅ Found Scanne page: ${scannePage.title}`);
    console.log(`🔗 WebSocket URL: ${scannePage.webSocketDebuggerUrl}`);
    
    try {
        const ws = await connectToDebugger(scannePage.webSocketDebuggerUrl);
        
        console.log('🎯 Listening for console messages...');
        console.log('💡 Try opening the browser and typing in the console:');
        console.log('   console.log("Hello from Edge to VS Code!");');
        console.log('   console.error("This is an error message");');
        console.log('   console.warn("This is a warning");');
        
        // Send a test console message from our script
        setTimeout(() => {
            ws.send(JSON.stringify({
                id: 3,
                method: 'Runtime.evaluate',
                params: {
                    expression: 'console.log("🎉 Test message from VS Code to Edge console!");'
                }
            }));
        }, 2000);
        
        // Keep the connection alive for testing
        setTimeout(() => {
            console.log('⏰ Test completed. Closing connection...');
            ws.close();
        }, 30000);
        
    } catch (error) {
        console.log('❌ Failed to connect to debugger:', error.message);
    }
}

// Run the test
testConsoleIntegration();

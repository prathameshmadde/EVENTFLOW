const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9229/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const targets = JSON.parse(data);
        const wsUrl = targets[0].webSocketDebuggerUrl;
        
        const ws = new WebSocket(wsUrl);
        let msgId = 1;
        
        ws.on('open', () => {
            ws.send(JSON.stringify({ id: msgId++, method: 'Debugger.enable' }));
        });
        
        ws.on('message', (msg) => {
            const response = JSON.parse(msg);
            
            if (response.method === 'Debugger.scriptParsed') {
                const scriptId = response.params.scriptId;
                const url = response.params.url;
                
                if (url && url.includes('app.js') && !url.includes('node_modules')) {
                    ws.send(JSON.stringify({
                        id: msgId++,
                        method: 'Debugger.getScriptSource',
                        params: { scriptId: scriptId }
                    }));
                }
            }
            
            if (response.result && response.result.scriptSource) {
                fs.writeFileSync('app_recovered.js', response.result.scriptSource);
                console.log('RECOVERED app.js FROM MEMORY!');
                process.exit(0);
            }
        });
    });
});


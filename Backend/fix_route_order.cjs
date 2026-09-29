const fs = require('fs');

let appjs = fs.readFileSync('app.js', 'utf8');

// Find the start of the injected endpoints
const injectedStart = appjs.indexOf('// ==================== RECEIPT PDF ====================');

// They go all the way down to just before app.listen
// Actually, let's find app.listen
const appListenIdx = appjs.indexOf('app.listen(');

if (injectedStart !== -1 && appListenIdx !== -1) {
    // Wait, the notifications are also injected here?
    // Let's check what is between injectedStart and appListenIdx
    const blockToMove = appjs.substring(injectedStart, appListenIdx);
    
    // Remove it from the current position
    appjs = appjs.substring(0, injectedStart) + appjs.substring(appListenIdx);
    
    // Now find the API 404 comment
    const api404Marker = '/* =========================================================\r\n   API 404';
    let api404Idx = appjs.indexOf(api404Marker);
    if (api404Idx === -1) {
        // try with \n
        api404Idx = appjs.indexOf('/* =========================================================\n   API 404');
    }
    
    if (api404Idx !== -1) {
        appjs = appjs.substring(0, api404Idx) + blockToMove + '\n\n' + appjs.substring(api404Idx);
        fs.writeFileSync('app.js', appjs);
        console.log('Moved endpoints above 404 handler');
    } else {
        console.log('Could not find API 404 marker');
    }
} else {
    console.log('Could not find injected endpoints');
}


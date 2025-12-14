const { spawn } = require('child_process');
const http = require('http');

console.log("[NGROK] Starting ngrok tunnel on port 3000...");

// Start ngrok process
const ngrok = spawn('ngrok', ['http', '3000']);

ngrok.stdout.on('data', (data) => {
    // ngrok (without --log=stdout) doesn't output much to stdout usually in TUI mode,
    // but we listen anyway.
    // console.log(`[NGROK OUT]: ${data}`);
});

ngrok.stderr.on('data', (data) => {
    // ngrok writes some info to stderr
    // console.error(`[NGROK ERR]: ${data}`);
});

ngrok.on('close', (code) => {
    console.log(`[NGROK] process exited with code ${code}`);
});

// Function to fetch the tunnel URL
function getTunnelUrl() {
    const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                const tunnel = json.tunnels.find(t => t.proto === 'https');
                if (tunnel) {
                    console.log("\n=================================================================================");
                    console.log(`[NGROK] Public URL: \x1b[36m${tunnel.public_url}\x1b[0m`);
                    console.log("=================================================================================\n");
                    clearInterval(interval); // Stop polling once found
                }
            } catch (e) {
                // Ignore parsing errors, retry later
            }
        });
    });

    req.on('error', (e) => {
        // Retry if connection refused (ngrok still starting)
    });
}

// Poll for the URL every 1 second until found
const interval = setInterval(() => {
    getTunnelUrl();
}, 1000);

// Stop polling after 30 seconds to prevent infinite loop if something breaks
setTimeout(() => {
    clearInterval(interval);
}, 30000);

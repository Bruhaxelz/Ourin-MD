/**
 * @file keepalive.js
 * @description HTTP server ringan (port 7860) untuk Hugging Face Spaces healthcheck & pinger 24 jam + auto-restore session Base64
 * @author Larskibidi
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Restore creds.json dari Environment Secret SESSION_CREDS (Base64) jika tersedia
if (process.env.SESSION_CREDS) {
    try {
        const sessionDir = path.join(process.cwd(), 'storage', 'session');
        const credsPath = path.join(sessionDir, 'creds.json');
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        if (!fs.existsSync(credsPath)) {
            const decoded = Buffer.from(process.env.SESSION_CREDS.trim(), 'base64').toString('utf-8');
            JSON.parse(decoded); // validasi JSON
            fs.writeFileSync(credsPath, decoded, 'utf-8');
            console.log('[KIR4LR] Session creds.json berhasil dipulihkan dari Secret SESSION_CREDS!');
        }
    } catch (err) {
        console.error('[KIR4LR] Gagal memulihkan SESSION_CREDS:', err.message);
    }
}

const PORT = process.env.PORT || 7860;

const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'OK',
            bot: 'KIR4LR',
            developer: 'Larskibidi',
            uptimeSeconds: Math.floor(process.uptime())
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[KIR4LR] Keepalive HTTP server aktif di port ${PORT}`);
});

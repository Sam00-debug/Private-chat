const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

let messages = [];

// ==========================================
// BASE ROUTE (WEB LOGS)
// ==========================================
app.get('/', (req, res) => {
    let html = `
        <html>
        <head>
            <title>Chat Server Logs</title>
            <style>
                body { background: #111; color: #fff; font-family: Arial, sans-serif; padding: 20px; }
                .message { padding: 10px; margin: 6px 0; background: #1d1d1d; border-radius: 6px; }
                .name { font-weight: bold; }
                .time { color: #888; font-size: 12px; }
            </style>
        </head>
        <body>
            <h2>Chat Server Logs</h2>
    `;

    messages.forEach(message => {
        if (message.hidden) return; // Hide internal join/invite packets from web UI
        html += `
            <div class="message">
                <span class="name">${message.displayName || message.user}:</span>
                ${message.msg}
                <div class="time">${new Date(message.time).toLocaleString()} • ${message.source}</div>
            </div>
        `;
    });

    html += `</body></html>`;
    res.send(html);
});

// ==========================================
// SEND MESSAGE
// ==========================================
app.post('/send', (req, res) => {
    const { user, displayName, msg, private: isPrivate, source, jobId, hidden } = req.body;

    if (!user || !msg) {
        return res.status(400).json({ error: 'Missing user or msg' });
    }

    const message = {
        user: String(user),
        displayName: String(displayName || user),
        msg: String(msg),
        time: Date.now(),
        jobId: jobId || null,
        private: isPrivate === true,
        source: source || 'roblox',
        hidden: hidden === true
    };

    messages.push(message);

    // Keep only the latest 100 messages
    if (messages.length > 100) {
        messages.shift();
    }

    console.log(`[${message.source}] ${message.user}: ${message.msg} ${message.hidden ? '(hidden)' : ''}`);

    res.json({ success: true, message });
});

// ==========================================
// GET NEW MESSAGES
// ==========================================
app.get('/messages', (req, res) => {
    const since = parseInt(req.query.since) || 0;
    const newMessages = messages.filter(message => message.time > since);
    res.json(newMessages);
});

// ==========================================
// SERVER BOOTSTRAP
// ==========================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chat server listening on port ${PORT}`);
});

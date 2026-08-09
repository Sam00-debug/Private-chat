const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

let messages = [];


// ==========================================
// BASE ROUTE
// ==========================================

app.get('/', (req, res) => {
    res.send('Chat Server is Active!');
});


// ==========================================
// SEND MESSAGE
// Roblox OR Discord → Render
// ==========================================

app.post('/send', (req, res) => {

    const {
        user,
        msg,
        source
    } = req.body;

    if (!user || !msg) {
        return res.status(400).json({
            error: 'Missing user or msg'
        });
    }

    const message = {
        user: String(user),
        msg: String(msg),
        time: Date.now(),
        source: source || 'roblox'
    };

    messages.push(message);

    // Keep only the latest 100 messages
    if (messages.length > 100) {
        messages.shift();
    }

    console.log(
        `[${message.source}] ${message.user}: ${message.msg}`
    );

    res.json({
        success: true,
        message: message
    });
});


// ==========================================
// GET NEW MESSAGES
// Render → Roblox / Discord
// ==========================================

app.get('/messages', (req, res) => {

    const since = parseInt(req.query.since) || 0;

    const newMessages = messages.filter(
        message => message.time > since
    );

    res.json(newMessages);
});


// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(
        `Chat server holding open on port ${PORT}`
    );
});

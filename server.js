const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

let messages = [];

// Base route so Render knows the site is alive when visited directly
app.get('/', (req, res) => {
    res.send("Chat Server is Active!");
});

// Endpoint to receive messages
app.post('/send', (req, res) => {
    const { user, msg } = req.body;
    if (user && msg) {
        messages.push({
            user: user,
            msg: msg,
            time: Date.now()
        });
        if (messages.length > 100) messages.shift(); 
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Missing user or msg" });
    }
});

// Endpoint to fetch new messages
app.get('/messages', (req, res) => {
    const since = parseInt(req.query.since) || 0;
    const newMessages = messages.filter(m => m.time > since);
    res.json(newMessages);
});

// CRITICAL: Bind to 0.0.0.0 and process.env.PORT so Render connects perfectly
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chat server holding open on port ${PORT}`);
});


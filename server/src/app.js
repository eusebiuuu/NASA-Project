const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();

const { apiV1 } = require('./routes/api_v1');

app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:8080'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});
app.use(morgan('common'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/v1', apiV1);

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
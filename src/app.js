const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.route');

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is working!' });
});

module.exports = app;
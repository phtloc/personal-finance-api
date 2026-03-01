const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');
const authRoutes = require('./routes/auth.route');
const categoryRoutes = require('./routes/category.route');
const transactionRoutes = require('./routes/transaction.route');
const walletRoutes = require('./routes/wallet.route');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true 
}));app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api-docs.json', (req, res) => {
    res.json(swaggerDocument);
});
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallets', walletRoutes);


app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is working!' });
});

module.exports = app;
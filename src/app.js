const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');
const authRoutes = require('./routes/auth.route');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api-docs.json', (req, res) => {
    res.json(swaggerDocument);
});
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is working!' });
});

module.exports = app;
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Đường dẫn: POST /api/auth/register
router.post('/register', authController.register);

module.exports = router;
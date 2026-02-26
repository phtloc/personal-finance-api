const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const registerUser = async (email, password, fullName) => {
    // 1. Kiểm tra email đã tồn tại chưa
    const userExist = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
        throw new Error('Email này đã được sử dụng!');
    }

    // 2. Mã hóa mật khẩu (Hashing)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Lưu vào Database
    const newUser = await db.query(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
        [email, passwordHash, fullName, 'user'] // Mặc định là 'user'
    );

    return newUser.rows[0];
};

const loginUser = async (email, password) => {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rowCount === 0) {
        throw new Error('Email hoặc mật khẩu không chính xác!');
    }
    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    const payload = {
        id: user.id,
        role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN 
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role
        },
        token
    };
};

module.exports = { registerUser, loginUser };
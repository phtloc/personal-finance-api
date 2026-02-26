const bcrypt = require('bcryptjs');
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

module.exports = { registerUser };
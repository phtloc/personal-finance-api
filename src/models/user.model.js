const db = require('../config/db');

// Hàm tìm người dùng bằng Email
const findByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

// Hàm tìm người dùng bằng ID
const findById = async (id) => {
    const result = await db.query(
        'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

// Hàm tạo người dùng mới
const create = async (email, passwordHash, fullName, role = 'user') => {
    const result = await db.query(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
        [email, passwordHash, fullName, role]
    );
    return result.rows[0];
};

module.exports = { findByEmail, findById, create };
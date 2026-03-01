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

const findByIdWithPassword = async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

const updateFullName = async (id, fullName) => {
    const result = await db.query(
        'UPDATE users SET full_name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, full_name, role',
        [fullName, id]
    );
    return result.rows[0];
};

const updatePassword = async (id, passwordHash) => {
    await db.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [passwordHash, id]
    );
};

module.exports = { findByEmail, findById, create, findByIdWithPassword, updateFullName, updatePassword };
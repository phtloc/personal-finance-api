const db = require('../config/db');

const getCategories = async (userId) => {
    const result = await db.query(
        'SELECT * FROM categories WHERE user_id = $1 OR is_system = true ORDER BY created_at DESC',
        [userId]
    );
    return result.rows;
};

const createCategory = async (userId, name, type, icon) => {
    const result = await db.query(
        `INSERT INTO categories (user_id, name, type, icon) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, name, type, icon]
    );
    return result.rows[0];
};

const updateCategory = async (categoryId, userId, name, type, icon) => {
    const result = await db.query(
        `UPDATE categories 
         SET name = $1, type = $2, icon = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4 AND user_id = $5 
         RETURNING *`,
        [name, type, icon, categoryId, userId]
    );
    return result.rows[0];
};

const deleteCategory = async (categoryId, userId) => {
    const result = await db.query(
        `DELETE FROM categories 
         WHERE id = $1 AND user_id = $2 
         RETURNING id`,
        [categoryId, userId]
    );
    return result.rows[0];
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
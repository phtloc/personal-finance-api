const db = require('../config/db');

const getWallets = async (userId) => {
    const result = await db.query('SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
    return result.rows;
};

const createWallet = async (userId, name, icon, initialBalance) => {
    const result = await db.query(
        `INSERT INTO wallets (user_id, name, icon, balance) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, name, icon, initialBalance || 0]
    );
    return result.rows[0];
};

const updateWallet = async (walletId, userId, name, icon, balance) => {
    const result = await db.query(
        `UPDATE wallets 
         SET name = $1, icon = $2, balance = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4 AND user_id = $5 RETURNING *`,
        [name, icon, balance, walletId, userId]
    );
    return result.rows[0];
};

const deleteWallet = async (walletId, userId) => {
    const result = await db.query(
        `DELETE FROM wallets WHERE id = $1 AND user_id = $2 RETURNING id`,
        [walletId, userId]
    );
    return result.rows[0];
};

module.exports = { getWallets, createWallet, updateWallet, deleteWallet };
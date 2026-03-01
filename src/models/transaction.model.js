const db = require('../config/db');

const getTransactions = async (userId) => {
    const result = await db.query(
        `SELECT t.*, 
                c.name as category_name, c.type as category_type, c.icon as category_icon,
                w.name as wallet_name, w.icon as wallet_icon
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN wallets w ON t.wallet_id = w.id
         WHERE t.user_id = $1
         ORDER BY t.transaction_date DESC, t.created_at DESC`,
        [userId]
    );
    return result.rows;
};

const createTransaction = async (userId, walletId, categoryId, amount, transactionDate, notes) => {
    // 1. Mượn 1 kết nối (client) độc quyền từ Database
    const client = await db.connect();
    
    try {
        await client.query('BEGIN');

        const catRes = await client.query('SELECT type FROM categories WHERE id = $1 AND user_id = $2', [categoryId, userId]);
        if (catRes.rowCount === 0) throw new Error('Danh mục không tồn tại!');
        const categoryType = catRes.rows[0].type;

        const transRes = await client.query(
            `INSERT INTO transactions (user_id, wallet_id, category_id, amount, transaction_date, notes) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, walletId, categoryId, amount, transactionDate, notes]
        );
        const newTransaction = transRes.rows[0];

        if (categoryType === 'INCOME') {
            await client.query('UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [amount, walletId, userId]);
        } else if (categoryType === 'EXPENSE') {
            await client.query('UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND user_id = $3', [amount, walletId, userId]);
        }

        await client.query('COMMIT');
        return newTransaction;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const deleteTransaction = async (transactionId, userId) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const transRes = await client.query(
            `SELECT t.amount, t.wallet_id, c.type 
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.id = $1 AND t.user_id = $2`, 
            [transactionId, userId]
        );
        
        if (transRes.rowCount === 0) throw new Error('Không tìm thấy giao dịch!');
        const trans = transRes.rows[0];

        if (trans.type === 'INCOME') {
            await client.query('UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND user_id = $3', [trans.amount, trans.wallet_id, userId]);
        } else if (trans.type === 'EXPENSE') {
            await client.query('UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [trans.amount, trans.wallet_id, userId]);
        }

        await client.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [transactionId, userId]);

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getStatistics = async (userId, startDate, endDate) => {
    let query = `
        SELECT 
            COALESCE(SUM(CASE WHEN c.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS total_income,
            COALESCE(SUM(CASE WHEN c.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS total_expense
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1
    `;
    const params = [userId];

    if (startDate && endDate) {
        query += ` AND t.transaction_date >= $2 AND t.transaction_date <= $3`;
        params.push(startDate, endDate);
    }

    const result = await db.query(query, params);
    return result.rows[0];
};

module.exports = { getTransactions, createTransaction, deleteTransaction, getStatistics };
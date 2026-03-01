const transactionService = require('../services/transaction.service');

const getAllTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await transactionService.getUserTransactions(userId);
        res.status(200).json({ data: transactions });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

const createTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const newTransaction = await transactionService.createNewTransaction(userId, req.body);
        res.status(201).json({ message: 'Tạo giao dịch thành công!', data: newTransaction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;
        const updated = await transactionService.updateTransactionById(transactionId, userId, req.body);
        res.status(200).json({ message: 'Cập nhật giao dịch thành công!', data: updated });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;
        await transactionService.deleteTransactionById(transactionId, userId);
        res.status(200).json({ message: 'Xóa giao dịch thành công!' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getStatistics = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Truyền toàn bộ req.query sang cho service xử lý
        const stats = await transactionService.getTransactionStats(userId, req.query);

        res.status(200).json({
            message: 'Lấy thống kê thành công',
            data: stats
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }   
};

module.exports = { getAllTransactions, createTransaction, updateTransaction, deleteTransaction, getStatistics };
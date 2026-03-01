const transactionModel = require('../models/transaction.model');

const getUserTransactions = async (userId) => {
    return await transactionModel.getTransactions(userId);
};

const createNewTransaction = async (userId, data) => {
    const { walletId, categoryId, amount, transactionDate, notes } = data;

    if (!walletId || !categoryId || !amount || !transactionDate) {
        throw new Error('Ví, Danh mục, Số tiền và Ngày giao dịch là bắt buộc!');
    }
    if (amount <= 0) {
        throw new Error('Số tiền giao dịch phải lớn hơn 0!');
    }

    return await transactionModel.createTransaction(userId, walletId, categoryId, amount, transactionDate, notes);
};

const updateTransactionById = async (transactionId, userId, data) => {
    const { categoryId, amount, transactionDate, notes } = data;

    if (!categoryId || !amount || !transactionDate) {
        throw new Error('Danh mục, số tiền và ngày giao dịch là bắt buộc!');
    }

    const updated = await transactionModel.updateTransaction(transactionId, userId, categoryId, amount, transactionDate, notes);
    if (!updated) {
        throw new Error('Không tìm thấy giao dịch hoặc bạn không có quyền sửa!');
    }
    return updated;
};

const deleteTransactionById = async (transactionId, userId) => {
    const deleted = await transactionModel.deleteTransaction(transactionId, userId);
    if (!deleted) {
        throw new Error('Không tìm thấy giao dịch hoặc bạn không có quyền xóa!');
    }
    return deleted;
};

const getTransactionStats = async (userId, queryParams) => {
    const { all, month, year } = queryParams;
    
    let start = null;
    let end = null;
    let periodLabel = "Toàn thời gian";

    if (all !== 'true') {
        const currentDate = new Date();
        // Nếu không truyền year/month, mặc định lấy năm và tháng hiện tại
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1; // getMonth() trả từ 0-11 nên phải + 1

        // Lấy số ngày tối đa trong tháng đó (VD: tháng 2/2026 có 28 ngày)
        const lastDayOfMonth = new Date(targetYear, targetMonth, 0).getDate();

        // Format lại chuỗi ngày cho đẹp và chuẩn SQL (YYYY-MM-DD)
        const formatMonth = String(targetMonth).padStart(2, '0'); // Biến 2 thành '02'
        const formatLastDay = String(lastDayOfMonth).padStart(2, '0');

        start = `${targetYear}-${formatMonth}-01`;
        end = `${targetYear}-${formatMonth}-${formatLastDay}`;
        periodLabel = `Tháng ${targetMonth}/${targetYear}`;
    }

    const stats = await transactionModel.getStatistics(userId, start, end);

    const totalIncome = parseFloat(stats.total_income);
    const totalExpense = parseFloat(stats.total_expense);
    const balance = totalIncome - totalExpense;

    return {
        period: periodLabel,
        startDate: start,
        endDate: end,
        totalIncome,
        totalExpense,
        balance
    };
};

module.exports = { 
    getUserTransactions, createNewTransaction, updateTransactionById, deleteTransactionById, getTransactionStats
};
const walletModel = require('../models/wallet.model');

const getUserWallets = async (userId) => {
    return await walletModel.getWallets(userId);
};

const createNewWallet = async (userId, data) => {
    const { name, icon, initialBalance } = data;
    if (!name) throw new Error('Tên ví là bắt buộc!');
    return await walletModel.createWallet(userId, name, icon, initialBalance);
};

const updateWalletById = async (walletId, userId, data) => {
    const { name, icon, balance } = data;
    if (!name) throw new Error('Tên ví là bắt buộc!');
    const updated = await walletModel.updateWallet(walletId, userId, name, icon, balance);
    if (!updated) throw new Error('Không tìm thấy ví!');
    return updated;
};

const deleteWalletById = async (walletId, userId) => {
    const deleted = await walletModel.deleteWallet(walletId, userId);
    if (!deleted) throw new Error('Không tìm thấy ví!');
    return deleted;
};

module.exports = { getUserWallets, createNewWallet, updateWalletById, deleteWalletById };
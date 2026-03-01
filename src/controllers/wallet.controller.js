const walletService = require('../services/wallet.service');

const getAllWallets = async (req, res) => {
    try {
        const wallets = await walletService.getUserWallets(req.user.id);
        res.status(200).json({ data: wallets });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createWallet = async (req, res) => {
    try {
        const newWallet = await walletService.createNewWallet(req.user.id, req.body);
        res.status(201).json({ message: 'Tạo ví thành công', data: newWallet });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const updateWallet = async (req, res) => {
    try {
        const updated = await walletService.updateWalletById(req.params.id, req.user.id, req.body);
        res.status(200).json({ message: 'Cập nhật ví thành công', data: updated });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteWallet = async (req, res) => {
    try {
        await walletService.deleteWalletById(req.params.id, req.user.id);
        res.status(200).json({ message: 'Xóa ví thành công' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

module.exports = { getAllWallets, createWallet, updateWallet, deleteWallet };
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', walletController.getAllWallets);
router.post('/', walletController.createWallet);
router.put('/:id', walletController.updateWallet);
router.delete('/:id', walletController.deleteWallet);

module.exports = router;
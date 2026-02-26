const authService = require('../services/auth.service');

const register = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Kiểm tra dữ liệu đầu vào cơ bản
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
        }

        const user = await authService.registerUser(email, password, fullName);

        res.status(201).json({
            message: 'Đăng ký tài khoản thành công!',
            data: user
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { register };
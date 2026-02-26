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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
        }

        // Gọi logic từ service
        const result = await authService.loginUser(email, password);

        res.status(200).json({
            message: 'Đăng nhập thành công!',
            data: result
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        // Gọi Service thay vì tự gọi Database
        const userProfile = await authService.getUserProfile(userId);

        res.status(200).json({ data: userProfile });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { register, login, getProfile };
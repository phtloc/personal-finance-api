const authService = require('../services/auth.service');
const db = require('../config/db');

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
        console.log(userId);

        const userResult = await db.query(
            'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = $1', 
            [userId]
        );

        res.status(200).json({ data: userResult.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { register, login, getProfile };
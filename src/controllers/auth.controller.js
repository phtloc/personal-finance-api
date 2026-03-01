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

        res.cookie('token', result.token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Đăng nhập thành công!',
            data: result.user 
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({ message: 'Đăng xuất thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng xuất' });
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

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName } = req.body;
        
        const updatedUser = await authService.updateProfile(userId, fullName);
        res.status(200).json({ message: 'Cập nhật thông tin thành công!', data: updatedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        
        await authService.changePassword(userId, oldPassword, newPassword);
        res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { register, login, logout, getProfile, updateProfile, changePassword };
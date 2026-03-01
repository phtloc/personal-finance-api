const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const registerUser = async (email, password, fullName) => {
    // 1. Kiểm tra email đã tồn tại chưa
    const userExist = await userModel.findByEmail(email);
    if (userExist) {
        throw new Error('Email này đã được sử dụng!');
    }

    // 2. Mã hóa mật khẩu (Hashing)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Lưu vào Database
    const newUser = await userModel.create(email, passwordHash, fullName);

    return newUser.rows[0];
};

const loginUser = async (email, password) => {
    // Tìm user qua Model
    const user = await userModel.findByEmail(email);
    if (!user) {
        throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    // Tạo Token
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN 
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role
        },
        token
    };
};

const getUserProfile = async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error('Không tìm thấy người dùng!');
    }
    return user;
};

const updateProfile = async (userId, fullName) => {
    if (!fullName) throw new Error('Vui lòng nhập họ tên mới!');
    return await userModel.updateFullName(userId, fullName);
};

const changePassword = async (userId, oldPassword, newPassword) => {
    if (!oldPassword || !newPassword) {
        throw new Error('Vui lòng nhập đầy đủ mật khẩu cũ và mới!');
    }

    // 1. Lấy thông tin user hiện tại
    const user = await userModel.findByIdWithPassword(userId);

    // 2. Kiểm tra mật khẩu cũ có khớp không
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
        throw new Error('Mật khẩu cũ không chính xác!');
    }

    // 3. Băm (hash) mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 4. Lưu vào Database
    await userModel.updatePassword(userId, newPasswordHash);
};

module.exports = { registerUser, loginUser, getUserProfile, updateProfile, changePassword };
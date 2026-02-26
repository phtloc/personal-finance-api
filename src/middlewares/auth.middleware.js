const jwt = require('jsonwebtoken');

// 1. Bảo vệ vòng ngoài (Dành cho mọi User đã đăng nhập)
const verifyToken = (req, res, next) => {
    // Client sẽ gửi token trên Header với định dạng: "Bearer <chuỗi_token>"
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Truy cập bị từ chối. Vui lòng đăng nhập!' });
    }

    try {
        // Giải mã token bằng Secret Key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Gắn thông tin người dùng (id, role) vào request để các Controller sau có thể lấy dùng
        req.user = decoded; 
        
        // Cho phép đi tiếp vào Controller
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

// 2. Bảo vệ vòng trong (Chỉ dành riêng cho Admin)
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Quyền truy cập bị từ chối. API này chỉ dành cho Admin!' });
        }
    });
};

module.exports = { verifyToken, verifyAdmin };
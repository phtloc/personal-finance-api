const jwt = require('jsonwebtoken');

// 1. Bảo vệ vòng ngoài (Dành cho mọi User đã đăng nhập)
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Truy cập bị từ chối. Vui lòng đăng nhập!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const newPayload = { ...decoded };
        delete newPayload.iat;
        delete newPayload.exp;

        // Ký tạo Token mới tinh với thời gian sống mới
        const newToken = jwt.sign(newPayload, process.env.JWT_SECRET, { 
            expiresIn: process.env.JWT_EXPIRES_IN 
        });

        // Gắn đè Cookie mới vào Response gửi về cho trình duyệt
        res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 
        });

        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn!' });
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
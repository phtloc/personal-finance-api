require('dotenv').config();
const app = require('./src/app.js');
const { pool } = require('./src/config/db.js');

const PORT = process.env.PORT || 5000;

// Test kết nối DB trước khi cho server lắng nghe
pool.connect((err, client, release) => {
    if (err) {
        console.error('Lỗi kết nối Database. Hãy kiểm tra lại file .env hoặc xem PostgreSQL đã chạy chưa.', err.stack);
        return;
    }
    console.log('Kết nối thành công tới PostgreSQL!');
    release(); 

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
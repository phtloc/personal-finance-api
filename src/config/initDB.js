const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDB() {
    // 1. Kết nối tạm vào db hệ thống 'postgres' để tạo Database
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: 'postgres',
    });

    try {
        await client.connect();
        const dbCheck = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
        
        if (dbCheck.rowCount === 0) {
            await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`Đã tạo thành công database: ${process.env.DB_NAME}`);
        }
        await client.end();

        // 2. Kết nối vào database vừa tạo để chạy các bảng
        const dbClient = new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
        });

        await dbClient.connect();
        
        // Chạy file init.sql để tạo bảng
        const sqlFilePath = path.join(__dirname, '../../database/init.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        await dbClient.query(sql);
        console.log('Khởi tạo cấu trúc bảng thành công!');

        const adminEmail = 'admin@finance.com';
        const plainPassword = 'admin123';

        const checkAdmin = await dbClient.query(`SELECT * FROM users WHERE email = $1`, [adminEmail]);

        if (checkAdmin.rowCount === 0) {
            console.log('Đang tạo tài khoản Admin mặc định...');
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);

            await dbClient.query(
                `INSERT INTO users (email, password_hash, role, full_name) VALUES ($1, $2, $3, $4)`,
                [adminEmail, hashedPassword, 'admin', 'System Administrator']
            );
            console.log(`Đã tạo Admin thành công!`);
            console.log(`Email: ${adminEmail}`);
            console.log(`Mật khẩu: ${plainPassword}`);
        } else {
            console.log(`Tài khoản Admin đã tồn tại, bỏ qua bước tạo.`);
        }

        await dbClient.end();

    } catch (error) {
        console.error('Lỗi khi khởi tạo Database:', error);
        process.exit(1);
    }
}

initializeDB();
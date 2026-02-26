const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDB() {
    // 1. Kết nối tới database mặc định 'postgres' để tạo database mới
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: 'postgres', // Kết nối tạm vào db hệ thống
    });

    try {
        await client.connect();
        
        // Kiểm tra và tạo Database nếu chưa có
        console.log(`Đang kiểm tra database ${process.env.DB_NAME}...`);
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
        const sqlFilePath = path.join(__dirname, '../../database/init.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        
        await dbClient.query(sql);
        console.log('Khởi tạo các bảng (Tables) thành công!');
        await dbClient.end();

    } catch (error) {
        console.error('Lỗi khi khởi tạo Database:', error);
        process.exit(1);
    }
}

initializeDB();
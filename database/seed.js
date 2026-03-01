require('dotenv').config();
const bcrypt = require('bcryptjs'); // 👈 Đã dùng bcryptjs theo đúng máy của bạn
const { fakerVI: faker } = require('@faker-js/faker'); 
const db = require('../src/config/db');

const seedDatabase = async () => {
    const client = await db.connect();
    
    try {
        console.log('⏳ Bắt đầu quá trình dọn dẹp và tạo dữ liệu giả...');
        await client.query('BEGIN');

        // 1. XÓA SẠCH DỮ LIỆU CŨ (Nhưng vẫn giữ nguyên cấu trúc bảng)
        await client.query('TRUNCATE TABLE transactions, categories, wallets, users CASCADE');
        console.log('✅ Đã xóa sạch dữ liệu cũ!');

        // 2. TẠO TÀI KHOẢN TEST
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('123456', salt);
        
        const userRes = await client.query(
            `INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
            ['demo@finance.com', passwordHash, 'Nguyễn Văn Demo', 'user']
        );
        const userId = userRes.rows[0].id;
        console.log('✅ Đã tạo tài khoản Test: demo@finance.com | Pass: 123456');

        // 3. TẠO VÍ TIỀN
        const wallets = [
            { name: 'Tiền mặt', icon: '💵', balance: faker.number.int({ min: 1000000, max: 5000000 }) },
            { name: 'Thẻ Vietcombank', icon: '💳', balance: faker.number.int({ min: 5000000, max: 20000000 }) },
            { name: 'Ví Momo', icon: '📱', balance: faker.number.int({ min: 500000, max: 3000000 }) }
        ];
        const walletIds = [];
        for (let w of wallets) {
            const wRes = await client.query(
                `INSERT INTO wallets (user_id, name, icon, balance) VALUES ($1, $2, $3, $4) RETURNING id`,
                [userId, w.name, w.icon, w.balance]
            );
            walletIds.push(wRes.rows[0].id);
        }

        // 4. TẠO DANH MỤC
        const categories = [
            { name: 'Lương', type: 'INCOME', icon: '💰' },
            { name: 'Đầu tư', type: 'INCOME', icon: '📈' },
            { name: 'Ăn uống', type: 'EXPENSE', icon: '🍔' },
            { name: 'Cà phê', type: 'EXPENSE', icon: '☕' },
            { name: 'Mua sắm', type: 'EXPENSE', icon: '🛒' },
            { name: 'Đi lại', type: 'EXPENSE', icon: '🚗' },
            { name: 'Hóa đơn', type: 'EXPENSE', icon: '💡' }
        ];
        const categoryIds = { INCOME: [], EXPENSE: [] };
        for (let c of categories) {
            const cRes = await client.query(
                `INSERT INTO categories (user_id, name, type, is_system, icon) VALUES ($1, $2, $3, $4, $5) RETURNING id, type`,
                [userId, c.name, c.type, true, c.icon]
            );
            categoryIds[c.type].push(cRes.rows[0].id);
        }

        // 5. TẠO 100 GIAO DỊCH RẢI RÁC TRONG 3 THÁNG QUA
        const NUM_TRANSACTIONS = 100; 
        for (let i = 0; i < NUM_TRANSACTIONS; i++) {
            const type = Math.random() < 0.2 ? 'INCOME' : 'EXPENSE';
            const walletId = faker.helpers.arrayElement(walletIds);
            const categoryId = faker.helpers.arrayElement(categoryIds[type]);
            
            const baseAmount = type === 'INCOME' 
                ? faker.number.int({ min: 1000, max: 20000 }) * 1000 
                : faker.number.int({ min: 20, max: 1000 }) * 1000;
            
            const transactionDate = faker.date.recent({ days: 90 });
            const notes = faker.lorem.sentence({ min: 3, max: 8 });

            await client.query(
                `INSERT INTO transactions (user_id, wallet_id, category_id, amount, transaction_date, notes) VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, walletId, categoryId, baseAmount, transactionDate, notes]
            );
        }

        await client.query('COMMIT');
        console.log('🎉 TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC LƯU VÀO DATABASE THÀNH CÔNG!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Có lỗi xảy ra, đã hoàn tác toàn bộ:', error);
    } finally {
        client.release();
        process.exit();
    }
};

seedDatabase();
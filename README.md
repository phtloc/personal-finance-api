# 💰 Personal Finance Manager - Quản Lý Tài Chính Cá Nhân

Một ứng dụng Fullstack quản lý tài chính cá nhân toàn diện, giúp người dùng theo dõi thu chi, quản lý đa ví và trực quan hóa dữ liệu dòng tiền một cách thông minh.

## ✨ Tính năng nổi bật

* **🔐 Xác thực bảo mật:** Đăng nhập/Đăng ký an toàn với mã hóa `bcrypt` và JSON Web Token (JWT) lưu trữ trong `httpOnly Cookie`.
* **💳 Quản lý Đa ví (Multi-Wallets):** Hỗ trợ tạo và quản lý số dư cho nhiều nguồn tiền khác nhau (Tiền mặt, Thẻ ATM, Ví điện tử).
* **📁 Quản lý Danh mục:** Phân loại Giao dịch theo Thu nhập (Income) và Chi tiêu (Expense) với hệ thống Icon trực quan.
* **💳 Giao dịch chuẩn ACID:** Xử lý logic cộng/trừ tiền tự động vào ví thông qua Database Transaction, đảm bảo tính toàn vẹn dữ liệu 100%.
* **🔍 Siêu bộ lọc (Smart Filter):** Lọc giao dịch kết hợp đồng thời nhiều điều kiện: Tháng/Năm, Ví tiền, và Danh mục.
* **📊 Dashboard Trực quan:** Thống kê dòng tiền và vẽ biểu đồ tỷ lệ Thu/Chi tự động bằng thư viện `D3.js`.
* **🌱 Dữ liệu mẫu (Seed Data):** Tích hợp công cụ tạo 100+ giao dịch mẫu thực tế bằng `@faker-js/faker`.

## 🛠️ Công nghệ sử dụng

| Trách nhiệm | Công nghệ / Thư viện |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, D3.js (Charts) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL, pg-pool |
| **Bảo mật** | bcryptjs, jsonwebtoken, cookie-parser, cors |
| **Khác** | Swagger (API Docs), Faker.js (Seed Data), Postman |

## 🚀 Hướng dẫn cài đặt

**1. Clone dự án về máy**
\`\`\`bash
git clone https://github.com/TEN_CUA_BAN/personal-finance-api.git
cd personal-finance-api
\`\`\`

**2. Cài đặt các thư viện**
\`\`\`bash
npm install
\`\`\`

**3. Cấu hình biến môi trường**
Tạo file `.env` ở thư mục gốc và cấu hình kết nối Database PostgreSQL:
\`\`\`env
PORT=5000
DB_USER=postgres
DB_PASSWORD=mat_khau_cua_ban
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_db
JWT_SECRET=chuoi_bi_mat_cua_ban
\`\`\`

**4. Khởi tạo Database và Dữ liệu mẫu**
\`\`\`bash
npm run db:init
npm run seed
\`\`\`

**5. Chạy ứng dụng**
\`\`\`bash
npm run dev
\`\`\`
Mở trình duyệt và truy cập: `http://localhost:5000` (Tài khoản test: `demo@finance.com` / Pass: `123456`).

## 👨‍💻 Tác giả
* **[Tên của bạn]** - *Fullstack Developer*
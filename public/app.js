const fetchOptions = { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' };
const formatVND = (money) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(money);

let userCategories = []; // Lưu danh mục để dùng cho Form giao dịch

/* ================= AUTH ================= */
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch('/api/auth/login', { ...fetchOptions, method: 'POST', body: JSON.stringify({ email, password }) });
    const data = await res.json();

    if (res.ok) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-screen').style.display = 'flex';
        document.getElementById('welcomeText').innerText = `👋 Chào, ${data.data.fullName}`;

        // Load mặc định ngày hôm nay vào ô chọn ngày
        document.getElementById('trans-date').value = new Date().toISOString().split('T')[0];

        fetchDashboard();
        fetchCategories(); // Load danh mục ngầm để nạp vào thẻ <select>
    } else {
        document.getElementById('errorMsg').innerText = data.message;
        document.getElementById('errorMsg').style.display = 'block';
    }
}

async function handleLogout() {
    await fetch('/api/auth/logout', { ...fetchOptions, method: 'POST' });
    location.reload(); // Tải lại trang cho sạch dữ liệu
}

function switchView(viewName) {
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');

    if (viewName === 'dashboard') fetchDashboard();
    if (viewName === 'categories') fetchCategories();
    if (viewName === 'transactions') fetchTransactions();
    if (viewName === 'wallets') fetchWallets();
}

/* ================= THỐNG KÊ & BIỂU ĐỒ D3.JS ================= */
async function fetchDashboard() {
    const range = document.getElementById('timeRange').value;
    const now = new Date();
    let income = 0, expense = 0, balance = 0;

    if (range === 'this_month') {
        // Tháng này
        const res = await fetch(`/api/transactions/stats?month=${now.getMonth() + 1}&year=${now.getFullYear()}`, fetchOptions);
        const result = await res.json();
        income = parseFloat(result.data.totalIncome); expense = parseFloat(result.data.totalExpense); balance = parseFloat(result.data.balance);
    }
    else if (range === 'last_month') {
        // Tháng trước (Xử lý lùi năm nếu tháng hiện tại là tháng 1)
        let lastMonth = now.getMonth();
        let year = now.getFullYear();
        if (lastMonth === 0) { lastMonth = 12; year -= 1; }
        const res = await fetch(`/api/transactions/stats?month=${lastMonth}&year=${year}`, fetchOptions);
        const result = await res.json();
        income = parseFloat(result.data.totalIncome); expense = parseFloat(result.data.totalExpense); balance = parseFloat(result.data.balance);
    }
    else if (range === 'this_year') {
        // Năm nay: Tính toán trực tiếp trên Frontend bằng cách tải toàn bộ và lọc theo năm
        const res = await fetch('/api/transactions', fetchOptions);
        const result = await res.json();
        const currentYear = now.getFullYear();

        result.data.forEach(t => {
            const tYear = new Date(t.transaction_date).getFullYear();
            if (tYear === currentYear) {
                if (t.category_type === 'INCOME') income += parseFloat(t.amount);
                else expense += parseFloat(t.amount);
            }
        });
        balance = income - expense;
    }

    // Hiển thị số liệu
    document.getElementById('lbl-income').innerText = formatVND(income);
    document.getElementById('lbl-expense').innerText = formatVND(expense);
    document.getElementById('lbl-balance').innerText = formatVND(balance);

    // Vẽ biểu đồ bằng D3.js
    drawChart(income, expense);
}

function drawChart(income, expense) {
    // 1. Dọn dẹp biểu đồ cũ
    d3.select("#d3-chart").selectAll("*").remove();

    if (income === 0 && expense === 0) {
        d3.select("#d3-chart").append("p").text("Chưa có giao dịch nào trong khoảng thời gian này.").style("color", "#7f8c8d");
        return;
    }

    // 2. Chuẩn bị dữ liệu và kích thước
    const data = [{ label: 'Thu', value: income, color: '#2ecc71' }, { label: 'Chi', value: expense, color: '#e74c3c' }];
    const width = 300, height = 300, radius = Math.min(width, height) / 2;

    // 3. Khởi tạo thẻ SVG
    const svg = d3.select("#d3-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius); // Đổi innerRadius(80) nếu muốn thành Donut Chart

    // 4. Vẽ các mảnh ghép
    const arcs = svg.selectAll("arc").data(pie(data)).enter().append("g");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.9);

    // 5. Thêm chữ (Thu/Chi) vào giữa các khối
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => d.data.value > 0 ? d.data.label : "")
        .style("fill", "#fff").style("font-weight", "bold");
}

/* ================= CRUD DANH MỤC ================= */
async function fetchCategories() {
    try {
        const res = await fetch('/api/categories', fetchOptions);
        const result = await res.json();
        userCategories = result.data; 

        // 1. Đổ dữ liệu ra Bảng Quản lý Danh mục
        const tbody = document.getElementById('table-categories');
        if (tbody) {
            tbody.innerHTML = ''; 
            result.data.forEach(cat => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cat.icon || '📁'}</td>
                    <td><strong>${cat.name}</strong></td>
                    <td style="color: ${cat.type === 'INCOME' ? '#2ecc71' : '#e74c3c'}">${cat.type}</td>
                    <td>${cat.is_system ? '' : `<button class="btn-danger" onclick="deleteCategory('${cat.id}')">Xóa</button>`}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // 2. Gom nhóm dữ liệu Danh mục
        let incomeOptions = '<optgroup label="👇 NGUỒN THU NHẬP">';
        let expenseOptions = '<optgroup label="👇 KHOẢN CHI TIÊU">';

        result.data.forEach(cat => {
            const optionHTML = `<option value="${cat.id}">${cat.icon || ''} ${cat.name}</option>`;
            if (cat.type === 'INCOME') incomeOptions += optionHTML;
            else expenseOptions += optionHTML;
        });

        incomeOptions += '</optgroup>';
        expenseOptions += '</optgroup>';
        const finalOptions = expenseOptions + incomeOptions;

        // 3. Nạp vào Form thêm Giao dịch
        const selectBox = document.getElementById('trans-category');
        if (selectBox) selectBox.innerHTML = '<option value="">-- Chọn danh mục --</option>' + finalOptions;

        // 4. Nạp vào Ô Lọc Danh mục (Thanh công cụ)
        const filterBox = document.getElementById('filter-category');
        if (filterBox) filterBox.innerHTML = '<option value="">-- Tất cả danh mục --</option>' + finalOptions;
        
    } catch (error) { console.error('Lỗi lấy danh mục', error); }
}

async function createCategory(e) {
    e.preventDefault();
    const name = document.getElementById('cat-name').value;
    const type = document.getElementById('cat-type').value;
    const icon = document.getElementById('cat-icon').value;

    await fetch('/api/categories', { ...fetchOptions, method: 'POST', body: JSON.stringify({ name, type, icon }) });
    document.getElementById('form-category').reset();
    fetchCategories();
}

async function deleteCategory(id) {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
        await fetch(`/api/categories/${id}`, { ...fetchOptions, method: 'DELETE' });
        fetchCategories();
    }
}

/* ================= LỌC VÀ HIỂN THỊ GIAO DỊCH ================= */
function clearFilter() {
    // Xóa trắng cả 3 ô lọc
    document.getElementById('filter-month').value = ''; 
    document.getElementById('filter-wallet').value = '';
    document.getElementById('filter-category').value = '';
    fetchTransactions(); 
}

async function fetchTransactions() {
    try {
        const res = await fetch('/api/transactions', fetchOptions);
        const result = await res.json();
        
        const tbody = document.getElementById('table-transactions');
        tbody.innerHTML = ''; 
        
        // 1. Đọc giá trị từ cả 3 bộ lọc
        const filterMonth = document.getElementById('filter-month').value;
        const filterWallet = document.getElementById('filter-wallet').value;
        const filterCategory = document.getElementById('filter-category').value;
        
        let filteredData = result.data;

        // 2. Logic lọc gộp (AND)
        filteredData = filteredData.filter(t => {
            let matchMonth = true;
            let matchWallet = true;
            let matchCategory = true;

            // Kiểm tra điều kiện Tháng
            if (filterMonth) {
                const [filterYear, filterMonthStr] = filterMonth.split('-');
                const dateObj = new Date(t.transaction_date);
                matchMonth = (dateObj.getFullYear() === parseInt(filterYear, 10)) && 
                             ((dateObj.getMonth() + 1) === parseInt(filterMonthStr, 10));
            }

            // Kiểm tra điều kiện Ví
            if (filterWallet) {
                matchWallet = (t.wallet_id === filterWallet);
            }

            // Kiểm tra điều kiện Danh mục
            if (filterCategory) {
                matchCategory = (t.category_id === filterCategory);
            }

            // Giao dịch chỉ được hiển thị nếu thỏa mãn TẤT CẢ các bộ lọc đang chọn
            return matchMonth && matchWallet && matchCategory;
        });
        
        // Hiển thị nếu không có dữ liệu phù hợp
        if (filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #7f8c8d; padding: 20px;">Không tìm thấy giao dịch nào phù hợp với bộ lọc!</td></tr>';
            return;
        }

        // 3. Đổ dữ liệu ra bảng
        filteredData.forEach(t => {
            const dateObj = new Date(t.transaction_date);
            const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
            const color = t.category_type === 'INCOME' ? '#2ecc71' : '#e74c3c';
            const sign = t.category_type === 'INCOME' ? '+' : '-';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td>${t.wallet_icon || '💳'} <strong>${t.wallet_name || 'Ví đã xóa'}</strong></td>
                <td>${t.category_icon || '📁'} ${t.category_name || 'DM đã xóa'}</td>
                <td style="color: ${color}; font-weight: bold;">${sign}${formatVND(t.amount)}</td>
                <td>${t.notes || ''}</td>
                <td><button class="btn-danger" onclick="deleteTransaction('${t.id}')">Xóa</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Lỗi lấy giao dịch', error);
    }
}

async function createTransaction(e) {
    e.preventDefault();
    const walletId = document.getElementById('trans-wallet').value; // Bổ sung lấy ID Ví
    const categoryId = document.getElementById('trans-category').value;
    const amount = document.getElementById('trans-amount').value;
    const transactionDate = document.getElementById('trans-date').value;
    const notes = document.getElementById('trans-notes').value;

    const res = await fetch('/api/transactions', {
        ...fetchOptions, method: 'POST',
        body: JSON.stringify({ walletId, categoryId, amount, transactionDate, notes })
    });

    if (res.ok) {
        document.getElementById('form-transaction').reset();
        document.getElementById('trans-date').value = new Date().toISOString().split('T')[0];
        fetchTransactions();
        fetchDashboard();
        fetchWallets(); // Gọi lại để cập nhật số dư hiển thị trong Dropdown
        alert('Đã lưu giao dịch & cập nhật số dư ví!');
    } else {
        const err = await res.json();
        alert('Lỗi: ' + err.message);
    }
}

async function deleteTransaction(id) {
    if (confirm('Bạn có chắc muốn xóa giao dịch này?')) {
        await fetch(`/api/transactions/${id}`, { ...fetchOptions, method: 'DELETE' });
        fetchTransactions();
        fetchDashboard();
    }
}

/* ================= LẤY DANH SÁCH VÍ ================= */
async function fetchWallets() {
    try {
        const res = await fetch('/api/wallets', fetchOptions);
        if (res.ok) {
            const result = await res.json();
            
            // 1. Nạp vào ô Chọn Ví ở Form Thêm Giao Dịch
            const selectBox = document.getElementById('trans-wallet');
            if (selectBox) {
                selectBox.innerHTML = '<option value="">-- Chọn ví --</option>';
                result.data.forEach(wallet => {
                    selectBox.innerHTML += `<option value="${wallet.id}">${wallet.icon || '💳'} ${wallet.name} (Dư: ${formatVND(wallet.balance)})</option>`;
                });
            }

            // 2. Nạp vào ô Lọc Ví (Thanh công cụ)
            const filterBox = document.getElementById('filter-wallet');
            if (filterBox) {
                filterBox.innerHTML = '<option value="">-- Tất cả ví --</option>';
                result.data.forEach(wallet => {
                    filterBox.innerHTML += `<option value="${wallet.id}">${wallet.icon || '💳'} ${wallet.name}</option>`;
                });
            }

            // 3. Cập nhật Bảng ở trang Quản lý Ví
            const tbody = document.getElementById('table-wallets');
            if (tbody) {
                tbody.innerHTML = '';
                result.data.forEach(wallet => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${wallet.icon || '💳'}</td>
                        <td><strong>${wallet.name}</strong></td>
                        <td style="color: #2ecc71; font-weight: bold;">${formatVND(wallet.balance)}</td>
                        <td><button class="btn-danger" onclick="deleteWallet('${wallet.id}')">Xóa</button></td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    } catch (error) { console.error('Lỗi lấy ví', error); }
}

/* ================= CRUD VÍ TIỀN ================= */
async function createWallet(e) {
    e.preventDefault();
    const icon = document.getElementById('wallet-icon').value;
    const name = document.getElementById('wallet-name').value;
    const initialBalance = document.getElementById('wallet-balance').value;
    
    const res = await fetch('/api/wallets', { 
        ...fetchOptions, method: 'POST', 
        body: JSON.stringify({ icon, name, initialBalance: parseFloat(initialBalance) }) 
    });

    if (res.ok) {
        document.getElementById('form-wallet').reset();
        fetchWallets(); // Load lại bảng và dropdown
        fetchDashboard(); // Cập nhật tổng số dư
    } else {
        const err = await res.json();
        alert('Lỗi: ' + err.message);
    }
}

async function deleteWallet(id) {
    // CẢNH BÁO QUAN TRỌNG: Xóa ví sẽ xóa luôn giao dịch của ví đó (ON DELETE CASCADE)
    if(confirm('⚠️ CẢNH BÁO: Xóa ví này sẽ XÓA VĨNH VIỄN toàn bộ giao dịch thuộc về nó. Bạn có chắc chắn?')) {
        const res = await fetch(`/api/wallets/${id}`, { ...fetchOptions, method: 'DELETE' });
        if (res.ok) {
            fetchWallets();
            fetchTransactions(); // Cập nhật lại lịch sử vì một số giao dịch đã biến mất
            fetchDashboard(); // Tính toán lại biểu đồ
        } else {
            const err = await res.json();
            alert('Lỗi: ' + err.message);
        }
    }
}

window.onload = async () => {
    try {
        const res = await fetch('/api/auth/profile', fetchOptions);

        if (res.ok) {
            const data = await res.json();
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app-screen').style.display = 'flex';
            const userName = data.data.fullName || data.data.full_name || 'Bạn';
            document.getElementById('welcomeText').innerText = `👋 Chào, ${userName}`;
            document.getElementById('trans-date').value = new Date().toISOString().split('T')[0];

            fetchDashboard();
            fetchCategories();
            fetchWallets();
        }
    } catch (error) {
        console.log("Chưa đăng nhập hoặc session hết hạn.");
    }
};
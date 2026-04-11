/**
 * 1. ĐỊNH NGHĨA HÀM ĐĂNG XUẤT TOÀN CỤC (GLOBAL)
 */
window.logout = async function () {
    const token = localStorage.getItem("token");

    if (!confirm("Bạn có chắc chắn muốn đăng xuất không?")) return;

    try {
        await fetch("http://localhost:8080/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
    } catch (e) {
        console.warn("Logout API không phản hồi hoặc lỗi:", e);
    }

    // Xóa toàn bộ dữ liệu phiên làm việc sạch sẽ
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    
    // Điều hướng về trang đăng nhập ở thư mục gốc
    window.location.href = "../dangnhap.html"; 
};

/**
 * 2. HÀM NẠP CÁC THÀNH PHẦN (SIDEBAR/HEADER)
 */
async function loadComponent(containerId, fileName, callback = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error(`Không tìm thấy file: ${fileName}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // Chạy callback sau khi HTML đã được chèn vào DOM
        if (callback) callback();
    } catch (err) {
        console.error("Lỗi nạp component:", err);
    }
}

/**
 * 3. HÀM HIỂN THỊ THÔNG TIN NGƯỜI DÙNG LÊN HEADER
 * Khớp với cấu trúc dữ liệu từ dangnhap.js
 */
function updateUserInfo() {
    try {
        // Lấy string userInfo từ localStorage
        const userInfoStr = localStorage.getItem('userInfo');
        
        if (userInfoStr) {
            // Chuyển đổi từ string JSON sang Object
            const userInfo = JSON.parse(userInfoStr);
            
            // Tìm phần tử hiển thị tên trong Header
            const nameElement = document.getElementById('header-admin-name');
            
            if (nameElement && userInfo.fullName) {
                nameElement.textContent = userInfo.fullName;
            }
        }
    } catch (error) {
        console.error("Lỗi khi bóc tách thông tin người dùng:", error);
    }
}

/**
 * 4. HÀM TỰ ĐỘNG ĐÁNH DẤU MENU ĐANG HOẠT ĐỘNG (ACTIVE)
 */
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split("/").pop() || 'tongquan.html';
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href').split("/").pop();
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 5. KHỞI CHẠY KHI TRANG WEB ĐÃ TẢI XONG DOM
 */
document.addEventListener("DOMContentLoaded", function() {
    // Nạp Sidebar: Sau khi xong thì highlight menu
    loadComponent('sidebar-container', 'sidebar.html', highlightCurrentPage);
    
    // Nạp Header: Sau khi xong thì cập nhật tên Admin từ userInfo
    loadComponent('header-container', 'header.html', updateUserInfo);
});
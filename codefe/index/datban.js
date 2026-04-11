/**
 * Project: Restaurant AI - Nhóm 18
 * Chức năng: Xử lý đặt bàn trực tuyến
 */

document.addEventListener('DOMContentLoaded', () => {
    const reservationForm = document.getElementById('reservationForm');
    const submitBtn = document.getElementById('submitBtn');

    // 1. Lấy thông tin xác thực từ LocalStorage
    const token = localStorage.getItem('accessToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // Kiểm tra quyền truy cập nhanh
    if (!token) {
        alert("Vui lòng đăng nhập trước khi đặt bàn!");
        window.location.href = '/dangnhap.html';
        return;
    }

    if (reservationForm) {
        reservationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 2. Lấy dữ liệu từ Form
            const date = document.getElementById('resDate').value;
            const time = document.getElementById('resTime').value;
            const guests = document.getElementById('guests').value;
            const note = document.getElementById('note').value;
            const area = document.querySelector('input[name="area"]:checked').value;

            // 3. Định dạng lại thời gian cho đúng LocalDateTime của Backend (YYYY-MM-DDTHH:mm:ss)
            const reservationTime = `${date}T${time}:00`;

            // 4. Chuẩn bị dữ liệu gửi đi (Khớp với ReservationRequest.java)
            const payload = {
                reservationTime: reservationTime,
                numberOfGuests: parseInt(guests),
                customerName: userInfo.fullName || "Khách hàng mới",
                customerPhone: "0708072270", // Nên lấy từ input hoặc userInfo nếu có
                tableId: null, // Hệ thống tự động xếp bàn trống
                note: `Khu vực mong muốn: ${area}. Ghi chú: ${note}`
            };

            try {
                // Hiệu ứng chờ
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...';

                // 5. Gọi API Backend
                const response = await axios.post('http://localhost:8080/api/reservations', payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    alert('Đặt bàn thành công! Hẹn gặp bạn vào ' + new Date(reservationTime).toLocaleString('vi-VN'));
                    // Chuyển hướng tới trang lịch sử để xem chi tiết
                    window.location.href = '/index/lichsu.html';
                }

            } catch (error) {
                console.error('Booking Error:', error);
                // Hiển thị thông báo lỗi từ Backend (Ví dụ: trùng giờ, quá khứ...)
                const message = error.response?.data?.message || "Đặt bàn thất bại. Vui lòng thử lại!";
                alert('Lỗi: ' + message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Xác nhận đặt bàn';
            }
        });
    }
});
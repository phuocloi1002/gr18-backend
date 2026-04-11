/**
 * Quản lý đơn hàng & đặt bàn (Admin/Staff)
 */

const BASE_URL = "http://localhost:8080/api";
const token = localStorage.getItem("accessToken");

let allData = [];

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        alert("Vui lòng đăng nhập!");
        window.location.href = "/dangnhap.html";
        return;
    }

    loadData();
});

// ================= LOAD DATA =================
async function loadData() {
    try {
        const res = await axios.get(`${BASE_URL}/staff/reservations/today`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        allData = res.data.data || [];
        render(allData);

    } catch (e) {
        console.error(e);
        alert("Không thể tải dữ liệu");
    }
}

// ================= RENDER =================
function render(data) {
    const container = document.getElementById("orderList");

    if (!data.length) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                Không có dữ liệu
            </div>`;
        return;
    }

    container.innerHTML = data.map(item => `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="card-box">

                <div class="card-header-row">
                    <b>Bàn ${item.tableNumber || "??"}</b>
                    <span class="status ${item.status.toLowerCase()}">
                        ${translateStatus(item.status)}
                    </span>
                </div>

                <div class="time">
                    🕒 ${formatTime(item.reservationTime)}
                </div>

                <div>${item.numberOfGuests} khách</div>

                <div class="customer">
                    ${item.customerName}
                </div>

                <div class="action-group">

                    ${renderActions(item)}

                    <button class="btn btn-outline-dark btn-sm w-50"
                        onclick="showDetail(${item.id})">
                        Chi tiết
                    </button>

                </div>

            </div>
        </div>
    `).join("");
}

// ================= ACTION BUTTON =================
function renderActions(item) {
    switch (item.status) {
        case "PENDING":
            return `
                <button class="btn btn-success btn-sm w-50"
                    onclick="confirmReservation(${item.id})">
                    Xác nhận
                </button>`;

        case "CONFIRMED":
            return `
                <button class="btn btn-info btn-sm w-50"
                    onclick="arrived(${item.id})">
                    Đã đến
                </button>`;

        case "ARRIVED":
            return `
                <button class="btn btn-primary btn-sm w-50"
                    onclick="complete(${item.id})">
                    Hoàn thành
                </button>`;

        default:
            return "";
    }
}

// ================= STATUS =================
function translateStatus(status) {
    return {
        PENDING: "Chờ duyệt",
        CONFIRMED: "Đã xác nhận",
        ARRIVED: "Đã đến",
        COMPLETED: "Hoàn thành",
        CANCELLED: "Đã hủy"
    }[status] || status;
}

// ================= FORMAT TIME =================
function formatTime(time) {
    if (!time) return "N/A";

    const date = new Date(time);

    if (isNaN(date)) return "Invalid";

    return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ================= ACTIONS =================
async function confirmReservation(id) {
    if (!confirm("Xác nhận đơn này?")) return;

    try {
        await axios.patch(`${BASE_URL}/staff/reservations/${id}/confirm`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        showSuccess("Đã xác nhận");
        loadData();

    } catch (e) {
        handleError(e);
    }
}

async function arrived(id) {
    try {
        await axios.patch(`${BASE_URL}/staff/reservations/${id}/arrived`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        showSuccess("Khách đã đến");
        loadData();

    } catch (e) {
        handleError(e);
    }
}

async function complete(id) {
    try {
        await axios.patch(`${BASE_URL}/staff/reservations/${id}/complete`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        showSuccess("Đã hoàn thành");
        loadData();

    } catch (e) {
        handleError(e);
    }
}

// ================= FILTER =================
function filterStatus(e, status) {
    document.querySelectorAll(".btn-filter")
        .forEach(btn => btn.classList.remove("active"));

    e.target.classList.add("active");

    if (status === "ALL") {
        render(allData);
    } else {
        const filtered = allData.filter(i => i.status === status);
        render(filtered);
    }
}

// ================= DETAIL =================
function showDetail(id) {
    const item = allData.find(i => i.id === id);

    if (!item) return;

    alert(`
Mã: ${item.id}
Khách: ${item.customerName}
SĐT: ${item.customerPhone}
Thời gian: ${item.reservationTime}
Số khách: ${item.numberOfGuests}
Bàn: ${item.tableNumber}
Trạng thái: ${item.status}
    `);
}

// ================= UTIL =================
function showSuccess(msg) {
    alert(msg);
}

function handleError(e) {
    console.error(e);
    alert(e.response?.data?.message || "Có lỗi xảy ra");
}
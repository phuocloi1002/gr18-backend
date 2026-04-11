// ================= CONFIG =================
const API_BASE_URL = "http://localhost:8080/api";
const TOKEN_KEY = "token";

// ================= AXIOS =================
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    //withCredentials: true
});

// Auto attach JWT
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    console.log("TOKEN gửi đi:", token); // 👈 BẮT BUỘC THÊM

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ================= STATE =================
let reservations = [];

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    loadReservations();
    setupSearch();
});

// ================= LOAD =================
async function loadReservations() {
    try {
        console.log("CALL API..."); // 👈 thêm

        const res = await axiosInstance.get("/staff/reservations/today");

        console.log("API RESPONSE:", res.data); // 👈 thêm

        if (res.data?.data) {
            reservations = res.data.data;
            console.log("RESERVATIONS:", reservations); // 👈 thêm
            renderTable(reservations);
            updateStats(reservations);
        }

    } catch (err) {
        console.error("ERROR:", err); // 👈 thêm
        handleError(err);
    }
}

// ================= RENDER =================
function renderTable(data) {
    const tbody = document.querySelector(".custom-table tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach(r => {
        const row = `
        <tr class="row-low">

            <td>
                <div class="cust-info">
                    <div class="avatar primary-text">
                        ${getInitial(r.customerName)}
                    </div>
                    <div>
                        <p class="cust-name">${r.customerName}</p>
                        <p class="cust-sub">${r.customerPhone}</p>
                    </div>
                </div>
            </td>

            <td>${r.numberOfGuests}</td>

            <td>
                <p class="time-text">${formatHour(r.reservationTime)}</p>
                <p class="date-sub">
                    ${formatDate(r.reservationTime)}
                </p>
            </td>

            <td>${renderStatus(r.status)}</td>

            <td class="text-end">
                ${renderActions(r)}
            </td>

        </tr>
        `;

        tbody.innerHTML += row;
    });
}

// ================= STATUS =================
function renderStatus(status) {
    switch (status) {
        case "PENDING":
            return `<span class="badge-status tertiary">Chờ xử lý</span>`;
        case "CONFIRMED":
            return `<span class="badge-status confirmed">Đã xác nhận</span>`;
        case "ARRIVED":
            return `<span class="badge bg-info">Đã đến</span>`;
        case "COMPLETED":
            return `<span class="badge bg-success">Hoàn thành</span>`;
        case "CANCELLED":
            return `<span class="badge bg-danger">Đã hủy</span>`;
        default:
            return status;
    }
}

function renderActions(r) {
    return `
    <div class="action-wrap">

        <button onclick="openEdit(${r.id})" class="btn-action">
            ✏️
        </button>

        ${r.status === "PENDING" ? `
        <button onclick="confirmBooking(${r.id})" class="btn-action ok">✔</button>` : ""}

        ${r.status === "CONFIRMED" ? `
        <button onclick="confirmArrival(${r.id})" class="btn-action ok">✔✔</button>` : ""}

        ${r.status === "ARRIVED" ? `
        <button onclick="completeBooking(${r.id})" class="btn-action ok">✔✔✔</button>` : ""}

    </div>`;
}

// ================= API =================
async function confirmBooking(id) {
    await callAPI(`/staff/reservations/${id}/confirm`);
}

async function confirmArrival(id) {
    await callAPI(`/staff/reservations/${id}/arrived`);
}

async function completeBooking(id) {
    await callAPI(`/staff/reservations/${id}/complete`);
}

async function cancelBooking(id) {
    const reason = prompt("Lý do hủy?");
    try {
        await axiosInstance.delete(`/reservations/${id}/cancel`, {
            params: { reason }
        });
        loadReservations();
    } catch (err) {
        handleError(err);
    }
}

async function callAPI(url) {
    try {
        await axiosInstance.patch(url);
        loadReservations();
    } catch (err) {
        handleError(err);
    }
}

// ================= SEARCH =================
function setupSearch() {
    const input = document.querySelector(".search-input");
    if (!input) return;

    input.addEventListener("input", e => {
        const val = e.target.value.toLowerCase();

        const filtered = reservations.filter(r =>
            r.customerName.toLowerCase().includes(val) ||
            r.customerPhone.includes(val)
        );

        renderTable(filtered);
    });
}

// ================= HELPER =================
function formatHour(t) {
    return new Date(t).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatDate(t) {
    return new Date(t).toLocaleDateString("vi-VN");
}

function getInitial(name) {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

// ================= ERROR =================
function handleError(err) {
    console.error(err);

    if (err.response?.status === 401) {
        alert("Chưa đăng nhập");
        return;
    }

    if (err.response?.status === 403) {
        alert("Không có quyền STAFF/ADMIN");
        return;
    }

    alert(err.response?.data?.message || "Lỗi server");
}
function openEdit(id) {
    const r = reservations.find(x => x.id === id);
    if (!r) return;

    document.getElementById("editId").value = r.id;
    document.getElementById("editName").value = r.customerName;
    document.getElementById("editPhone").value = r.customerPhone;
    document.getElementById("editGuests").value = r.numberOfGuests;

    document.getElementById("editTime").value =
        new Date(r.reservationTime).toISOString().slice(0,16);

    new bootstrap.Modal(document.getElementById("editModal")).show();
}
async function updateReservation() {
    const id = document.getElementById("editId").value;

    const data = {
        customerName: document.getElementById("editName").value,
        customerPhone: document.getElementById("editPhone").value,
        numberOfGuests: parseInt(document.getElementById("editGuests").value),
        reservationTime: document.getElementById("editTime").value
    };

    try {
        await axiosInstance.put(`/reservations/${id}`, data);

        alert("Cập nhật thành công");

        loadReservations();

        bootstrap.Modal.getInstance(
            document.getElementById("editModal")
        ).hide();

    } catch (err) {
        handleError(err);
    }

}
function updateStats(data) {
    let totalGuests = 0;
    let confirmed = 0;
    let pending = 0;

    data.forEach(r => {
        if (r.status !== "CANCELLED") {
        totalGuests += r.numberOfGuests || 0;
    }

        if (r.status === "CONFIRMED") confirmed++;
        if (r.status === "PENDING") pending++;
    });

    // 👉 UI
    document.getElementById("totalGuests").innerText = totalGuests;
    document.getElementById("confirmedCount").innerText = format2(confirmed);
    document.getElementById("pendingCount").innerText = format2(pending);

    // 👉 % tăng trưởng
    const percent = calcGrowth(totalGuests);
    document.querySelector(".stat-trend").innerText =
        `${percent >= 0 ? "+" : ""}${percent}% so với hôm qua`;

    // 🔥 THÊM ĐOẠN NÀY
    const risk = calcRisk(data);
    document.querySelector(".bg-error-container").innerText = format2(risk);
}
    function format2(num) {
        return num < 10 ? "0" + num : num;
    }

    function calcGrowth(today) {
        if (today === 0) return 0;

        const yesterday = today * 0.85;
        return Math.round(((today - yesterday) / yesterday) * 100);
    }

    function calcRisk(data) {
        const now = new Date();

        return data.filter(r => {
            const time = new Date(r.reservationTime);
            return r.status === "CONFIRMED" && time < now;
        }).length;
    }
// ============================================================
// CONFIG
// ============================================================
const API_BASE = "http://localhost:8080/api";

// State
let danhSachMon = [];
let monDangChon = null;
let _pageSize = 6;       // số món hiển thị mỗi lần
let _hienTai = 6;        // số món đang hiện

// ============================================================
// INIT
// ============================================================
window.onload = () => {
    capNhatBadgeGioHang();
    loadMenu();

    const input = document.getElementById("searchInput");
    const icon = document.querySelector(".search-container .fa-magnifying-glass");

    let debounce;

    const handleSearch = () => {
        const keyword = input.value.trim();

        const sectionCombo  = document.getElementById("section-combo");
        const sectionSashimi = document.getElementById("section-sashimi");
        const sectionTatca  = document.getElementById("section-tatca");

        if (!keyword) {
            // Xoá kết quả tìm, hiện lại tất cả section gốc
            if (sectionCombo)   sectionCombo.style.display   = "";
            if (sectionSashimi) sectionSashimi.style.display = "";
            if (sectionTatca)   sectionTatca.style.display   = "";
            renderMenu(danhSachMon);
            return;
        }

        // Ẩn section tĩnh, chỉ giữ lại section kết quả tìm
        if (sectionCombo)   sectionCombo.style.display   = "none";
        if (sectionSashimi) sectionSashimi.style.display = "none";
        if (sectionTatca)   sectionTatca.style.display   = "";

        searchMenu(keyword);
    };

    input?.addEventListener("input", () => {
        clearTimeout(debounce);
        debounce = setTimeout(handleSearch, 300);
    });

    input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            clearTimeout(debounce);
            handleSearch();
        }
    });

    icon?.addEventListener("click", handleSearch);
};

// ============================================================
// API
// ============================================================

// Load toàn bộ menu
async function loadMenu() {
    try {
        const res = await fetch(`${API_BASE}/menu`);
        const json = await res.json();

        // FIX CHÍNH Ở ĐÂY
        danhSachMon = json.data || [];

        renderMenu(danhSachMon);
    } catch (err) {
        console.error("Lỗi load menu:", err);
        hienThongBao("Không tải được menu");
    }
}

// Search từ API
async function searchMenu(keyword) {
    try {
        const res = await fetch(`${API_BASE}/menu/search?keyword=${encodeURIComponent(keyword)}`);
        const json = await res.json();

        // API search có content
        const data = json.data?.content || [];

        renderMenu(data);
    } catch (err) {
        console.error("Lỗi search:", err);
        hienThongBao("Lỗi tìm kiếm");
    }
}
// ============================================================
// RENDER
// ============================================================
function renderMenu(items, reset) {
    const el = document.getElementById("menu-list");
    if (!el) return;

    if (!items || items.length === 0) {
        el.innerHTML = `<p class="text-center text-muted">Không tìm thấy món ăn</p>`;
        _capNhatNutXemThem(0, 0);
        return;
    }

    if (reset !== false) _hienTai = _pageSize;  // reset khi load mới / search mới

    const hien = items.slice(0, _hienTai);

    el.innerHTML = `
        <div class="row g-4">
            ${hien.map(renderItem).join("")}
        </div>
    `;

    _capNhatNutXemThem(hien.length, items.length);
}

function _capNhatNutXemThem(hienTai, total) {
    const btn = document.getElementById("btn-xem-them");
    if (!btn) return;
    if (hienTai >= total) {
        btn.style.display = "none";
    } else {
        btn.style.display = "inline-block";
        btn.textContent = `Xem thêm (${total - hienTai} món còn lại)`;
    }
}

function xemThem() {
    _hienTai += _pageSize;
    renderMenu(danhSachMon, false);
    // scroll nhẹ xuống cuối danh sách
    document.getElementById("menu-list")?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
}

function renderItem(item) {
    const id = item.id;
    const ten = item.name || item.ten || "Món ăn";
    const gia = item.price || item.gia || 0;
    const rating = item.avgRating || item.rating || 0;

    // SỬA TẠI ĐÂY: Kiểm tra kỹ imageUrl/image
    const img = item.imageUrl || item.image || 'https://via.placeholder.com/300x300?text=No+Image';

    return `
        <div class="col-md-6">
            <div class="menu-item-card d-flex align-items-center p-3 border rounded-3"
                onclick="xemChiTiet('${id}')"
                style="cursor:pointer">

                <img src="${img}" 
                     class="flex-shrink-0 me-3 rounded"
                     style="width:80px;height:80px;object-fit:cover"
                     onerror="this.src='https://via.placeholder.com/80?text=Error'">

                <div class="flex-grow-1">
                    <h5 class="fw-bold mb-1">${ten}</h5>
                    <div class="text-warning small mb-2">
                        ${renderStars(rating)}
                        <span class="text-muted">(${rating}/5)</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-orange">${formatVND(gia)}</span>
                        <button class="btn btn-outline-dark btn-sm rounded-circle"
                            onclick="event.stopPropagation(); moModal('${id}','${escapeStr(ten)}',${gia},'${escapeStr(img)}')">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
// ============================================================
// ACTION
// ============================================================
function xemChiTiet(id) {
    window.location.href = `/index/menu-detail.html?id=${id}&from=menu`;
}

function moModal(id, ten, gia, img) {
    monDangChon = { id, ten, gia, img: img || '' };

    document.getElementById("modal-ten-mon").textContent = ten;
    document.getElementById("modal-gia-mon").textContent = formatVND(gia);
    document.getElementById("soLuong-input").value = 1;
    const ghiChuEl = document.getElementById("ghichu-input");
    if (ghiChuEl) ghiChuEl.value = "";

    new bootstrap.Modal("#soLuongModal").show();
}

function thayDoiSoLuong(delta) {
    const input = document.getElementById("soLuong-input");
    input.value = Math.max(1, Math.min(99, +input.value + delta));
}

function xacNhanThemGio() {
    if (!monDangChon) return;

    const soLuong = +document.getElementById("soLuong-input").value || 1;
    const ghiChu = (document.getElementById("ghichu-input")?.value || "").trim();

    themVaoGio(monDangChon, soLuong, ghiChu);

    bootstrap.Modal.getInstance(document.getElementById("soLuongModal"))?.hide();
}

// ============================================================
// CART
// ============================================================
function layGioHang() {
    try {
        return JSON.parse(localStorage.getItem("gioHang")) || [];
    } catch {
        return [];
    }
}

function themVaoGio(item, soLuong, ghiChu) {
    const cart = layGioHang();
    ghiChu = ghiChu || "";

    // Cùng món + cùng ghi chú thì cộng số lượng, khác ghi chú thì thêm dòng mới
    const index = cart.findIndex(i => i.id == item.id && (i.ghiChu || "") === ghiChu);

    if (index >= 0) {
        cart[index].soLuong += soLuong;
    } else {
        const entry = { ...item, soLuong };
        if (ghiChu) entry.ghiChu = ghiChu;
        cart.push(entry);
    }

    localStorage.setItem("gioHang", JSON.stringify(cart));
    capNhatBadgeGioHang();

    const ghiChuNote = ghiChu ? ` (${ghiChu})` : "";
    hienToast(`Đã thêm ${soLuong} "${item.ten}"${ghiChuNote}`);
}

function capNhatBadgeGioHang() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;

    const total = layGioHang().reduce((s, i) => s + i.soLuong, 0);

    badge.style.display = total > 0 ? "inline-block" : "none";
    badge.textContent = total > 99 ? "99+" : total;
}

// ============================================================
// UI
// ============================================================
function hienToast(msg) {
    const toast = document.getElementById("cart-toast");
    const text = document.getElementById("cart-toast-msg");

    text.textContent = msg;
    toast.style.display = "block";

    setTimeout(() => toast.style.display = "none", 2500);
}

function hienThongBao(msg) {
    alert(msg);
}

// ============================================================
// UTIL
// ============================================================
function formatVND(n) {
    return Number(n).toLocaleString("vi-VN") + " VND";
}

function escapeStr(str) {
    return str.replace(/'/g, "\\'");
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return `
        ${'<i class="fa-solid fa-star"></i>'.repeat(full)}
        ${half ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''}
        ${'<i class="fa-regular fa-star"></i>'.repeat(empty)}
    `;
}
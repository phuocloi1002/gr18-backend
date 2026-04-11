const API_BASE = "http://localhost:8080/api/admin";

function getToken() {
    return localStorage.getItem("accessToken");
}

// ===== API =====
async function api(url, options = {}) {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        },
        ...options
    });
    return res.json();
}

// ===== LOAD MENU =====
async function loadMenu() {
    const data = await api(`${API_BASE}/menu-items`);
    renderMenu(data.data);
}

// ===== RENDER MENU =====
    function renderMenu(items) {
    const container = document.getElementById("menuContainer");

    if (!container) {
    console.error("Không tìm thấy #menuContainer");
    return;
}

    container.innerHTML = "";

    items.forEach(item => {
        container.innerHTML += `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="menu-grid-card">
                <div class="img-wrapper">
                    <img src="${item.imageUrl || 'https://via.placeholder.com/300'}">
                </div>
                <div class="p-4">
                    <h5>${item.name}</h5>
                    <span>${item.price}</span>
                </div>
            </div>
        </div>`;
    });
}

// ===== DELETE =====
async function deleteItem(id) {
    if (!confirm("Xóa món này?")) return;

    await api(`${API_BASE}/menu-items/${id}`, {
        method: "DELETE"
    });

    loadMenu();
}

// ===== TOGGLE =====
async function toggleAvailable(id, isAvailable) {
    await api(`${API_BASE}/menu-items/${id}/availability?isAvailable=${!isAvailable}`, {
        method: "PATCH"
    });

    loadMenu();
}

// ===== CREATE =====
async function createItem() {
    const body = {
        name: document.getElementById("name").value,
        price: document.getElementById("price").value,
        categoryId: document.getElementById("category").value,
        description: document.getElementById("desc").value,
        imageUrl: document.getElementById("img").value
    };

    await api(`${API_BASE}/menu-items`, {
        method: "POST",
        body: JSON.stringify(body)
    });

    loadMenu();
    bootstrap.Modal.getInstance(document.getElementById('menuModal')).hide();
}

// ===== CATEGORY =====
async function loadCategories() {
    const data = await api(`${API_BASE}/categories`);
    renderCategories(data.data);
    fillCategorySelect(data.data);
}

function renderCategories(categories) {
    const nav = document.getElementById("categoryNav");

    if (!nav) return;

    nav.innerHTML = `
        <button class="nav-link active" onclick="loadMenu()">Tất cả</button>
    `;

    categories.forEach(c => {
        nav.innerHTML += `
            <button class="nav-link" onclick="filterByCategory(${c.id})">
                ${c.name}
            </button>
        `;
    });
}

// ===== SELECT CATEGORY =====
function fillCategorySelect(categories) {
    const select = document.getElementById("category");

    if (!select) {
        console.warn("Select category chưa tồn tại");
        return;
    }

    select.innerHTML = "";

    categories.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
}

// ===== FILTER =====
async function filterByCategory(categoryId) {
    const data = await api(`${API_BASE}/menu-items?categoryId=${categoryId}`);
    renderMenu(data.data);
}

// ===== EDIT (simple) =====
async function editItem(id) {
    const name = prompt("Tên mới:");
    if (!name) return;

    await api(`${API_BASE}/menu-items/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name })
    });

    loadMenu();
}

// ===== MODAL =====
function openCreateModal() {
    new bootstrap.Modal(document.getElementById('menuModal')).show();
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    loadMenu();
    loadCategories();
});
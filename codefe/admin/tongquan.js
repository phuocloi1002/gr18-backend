window.logout = async function () {
    const token = localStorage.getItem("token");

    try {
        await fetch("http://localhost:8080/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
    } catch (e) {
        console.log("Logout API lỗi:", e);
    }

    localStorage.removeItem("token");

    // 🔥 ĐÚNG 100%
    window.location.href = "/dangnhap.html";
};
// Hàm gọi API đăng nhập
function callLoginAPI(event) {
    event.preventDefault(); // Ngăn form reload trang

    // Lấy giá trị từ form
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const passwordError = document.getElementById("password-error");

    // Ẩn thông báo lỗi trước khi kiểm tra
    passwordError.classList.add("hidden");

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
        passwordError.textContent = "Vui lòng nhập đầy đủ email và mật khẩu!";
        passwordError.classList.remove("hidden");
        return false;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        passwordError.textContent = "Email không hợp lệ! Vui lòng nhập đúng định dạng email.";
        passwordError.classList.remove("hidden");
        return false;
    }

    // Kiểm tra mật khẩu: ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
        passwordError.textContent = "Mật khẩu không hợp lệ! Phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.";
        passwordError.classList.remove("hidden");
        return false;
    }

    console.log("Đang gửi yêu cầu đăng nhập:", { email });

    // Gọi API đăng nhập
    fetch("https://tiemsachnhaem-be-mu.vercel.app/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(res => {
        console.log("Trạng thái phản hồi:", res.status);
        
        if (!res.ok) {
            return res.text().then(text => {
                console.error("Chi tiết lỗi:", text);
                throw new Error(`Đăng nhập thất bại (${res.status}): ${text}`);
            });
        }
        return res.json();
    })
    .then(data => {
        console.log("Dữ liệu phản hồi:", data);
        
        // Kiểm tra nếu đăng nhập thành công và có token
        if (data && data.token) {
            // Lưu token vào localStorage
            localStorage.setItem("userToken", data.token);
            // Lưu thông tin người dùng nếu có
            if (data.user) {
                localStorage.setItem("userInfo", JSON.stringify(data.user));
            }
            
            alert("Đăng nhập thành công!");
            // Chuyển hướng đến trang chủ
            window.location.href = "../index.html";
        } else {
            // Nếu phản hồi thành công (res.ok) nhưng không có token,
            // hiển thị thông báo lỗi từ server hoặc thông báo mặc định
            console.error("Phản hồi thành công nhưng thiếu token:", data); // Log thêm thông tin
            alert(data.message || "Đăng nhập không thành công: Phản hồi server không hợp lệ.");
            // Đảm bảo div lỗi trên trang ẩn đi nếu có
            document.getElementById("password-error").classList.add("hidden");
        }
    })
    .catch(error => {
        console.error("Chi tiết lỗi đăng nhập (lỗi mạng/server):", error); // Log chi tiết lỗi bắt được
        // Ẩn div lỗi trên trang
        document.getElementById("password-error").classList.add("hidden");
        // Hiển thị lỗi trong alert box
        alert(error.message || "Đăng nhập thất bại do lỗi kết nối. Vui lòng thử lại.");
    });

    return false;
}

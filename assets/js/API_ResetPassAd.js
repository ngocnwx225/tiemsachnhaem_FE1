// --- Logic chạy khi script được load ---
// Lấy email từ URL parameters ngay khi trang tải
const urlParams = new URLSearchParams(window.location.search);
const resetEmail = urlParams.get('email');

// Kiểm tra xem có email từ URL không.
// Nếu không có, hiển thị cảnh báo và có thể chuyển hướng người dùng quay lại.
if (!resetEmail) {
    const errorMessage = "Không tìm thấy thông tin email. Vui lòng quay lại trang trước.";
    console.error(errorMessage);
    alert(errorMessage);
    // Tùy chọn: chuyển hướng người dùng quay lại trang quên mật khẩu 1
    // window.location.href = "../pages/quenMK1.html";
    // Ngăn không cho hàm submit form hoạt động nếu không có email
} else {
     console.log("Email cần đặt lại mật khẩu:", resetEmail);
}

// Hàm gọi API đặt lại mật khẩu
function callResetPassAPI(event) {
    event.preventDefault(); // Ngăn form reload trang

    // Nếu không có email (đã kiểm tra khi load script), dừng lại
    if (!resetEmail) {
        return false;
    }

    // Lấy element hiển thị lỗi
    const resetErrorDiv = document.getElementById("reset-error");

    // Ẩn thông báo lỗi trước khi kiểm tra
    resetErrorDiv.classList.add("hidden");
    resetErrorDiv.textContent = ""; // Xóa nội dung lỗi cũ

    // Lấy giá trị mật khẩu mới và xác nhận
    const newPassword = document.getElementById("pass1").value.trim();
    const confirmPassword = document.getElementById("pass2").value.trim();

    // --- Kiểm tra dữ liệu đầu vào từ form ---

    // Kiểm tra mật khẩu không trống
    if (!newPassword || !confirmPassword) {
        resetErrorDiv.textContent = "Vui lòng nhập đầy đủ mật khẩu mới và xác nhận.";
        resetErrorDiv.classList.remove("hidden");
        return false;
    }

    // Kiểm tra mật khẩu mới và xác nhận có khớp không
    if (newPassword !== confirmPassword) {
        resetErrorDiv.textContent = "Mật khẩu xác nhận không khớp với mật khẩu mới.";
        resetErrorDiv.classList.remove("hidden");
        return false;
    }

    // Kiểm tra mật khẩu: ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    if (!passwordRegex.test(newPassword)) {
        resetErrorDiv.textContent = "Mật khẩu mới không hợp lệ! Phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.";
        resetErrorDiv.classList.remove("hidden");
        return false;
    }


    console.log("Đang gửi yêu cầu đặt lại mật khẩu cho email:", resetEmail);

    // --- Gọi API đặt lại mật khẩu ---
    // Use the assumed correct endpoint and method
    fetch("https://tiemsachnhaem-be-mu.vercel.app/api/auth/reset-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: resetEmail, // Gửi email lấy từ URL
            newPassword: newPassword,
            confirmPassword: confirmPassword // API có thể cần trường này để kiểm tra lại ở backend
        })
    })
    .then(async res => {
        console.log("Trạng thái phản hồi:", res.status);

        if (res.ok) { // Status 200 OK - Đặt lại mật khẩu thành công
            let successMessage = "Mật khẩu của bạn đã được đặt lại thành công!";
            try {
                const data = await res.json();
                console.log("Dữ liệu phản hồi thành công:", data);
                successMessage = data.message || successMessage;
            } catch (e) {
                console.log("Phản hồi 200 nhưng không có JSON body.");
            }

            alert(successMessage);
            // Change the redirection target to quenMK3.html after successful password reset
            window.location.href = "../pages/quenMK3Ad.html?email=" + encodeURIComponent(resetEmail);

        } else { // Status not 200 (e.g., 400, 404, 500) - Đặt lại mật khẩu thất bại
            const errorText = await res.text();
            console.error("Chi tiết lỗi phản hồi:", errorText);

            let errorMessage = `Đặt lại mật khẩu thất bại (${res.status}).`;
            try {
                const errorData = JSON.parse(errorText);
                 // Cố gắng lấy thông báo lỗi chi tiết từ server
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Nếu body lỗi không phải JSON, dùng thông báo chung đã tạo
            }

            // Hiển thị lỗi trên div reset-error
            resetErrorDiv.textContent = errorMessage;
            resetErrorDiv.classList.remove("hidden");
            // Có thể dùng alert thay vì hiển thị trên form tùy ý
            // alert(errorMessage);
        }
    })
    .catch(error => {
        console.error("Chi tiết lỗi đặt lại mật khẩu (lỗi mạng/server):", error);
        // Ẩn div lỗi trên trang
        resetErrorDiv.classList.add("hidden");
        // Hiển thị lỗi mạng/server trong alert box
        alert("Có lỗi xảy ra khi gửi yêu cầu đặt lại mật khẩu. Vui lòng kiểm tra kết nối và thử lại.");
    });

    return false;
}

// Hàm validateResetPassword không còn cần thiết nếu dùng onsubmit
// function validateResetPassword() { ... }
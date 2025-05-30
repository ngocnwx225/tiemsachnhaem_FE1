const urlParams = new URLSearchParams(window.location.search);
const resetEmail = urlParams.get('email');

if (!resetEmail) {
    const errorMessage = "Không tìm thấy thông tin email. Vui lòng quay lại trang trước.";
    console.error(errorMessage);
    alert(errorMessage);
} else {
     console.log("Email cần đặt lại mật khẩu:", resetEmail);
}

function callResetPassAPI(event) {
    event.preventDefault(); // Ngăn form reload trang

    if (!resetEmail) {
        return false;
    }

    const resetErrorDiv = document.getElementById("reset-error");

    resetErrorDiv.classList.add("hidden");
    resetErrorDiv.textContent = ""; // Xóa nội dung lỗi cũ

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
            window.location.href = "../pages/quenMK3.html?email=" + encodeURIComponent(resetEmail);

        } else { // Status not 200 (e.g., 400, 404, 500) - Đặt lại mật khẩu thất bại
            const errorText = await res.text();
            console.error("Chi tiết lỗi phản hồi:", errorText);

            let errorMessage = `Đặt lại mật khẩu thất bại (${res.status}).`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
            }

            resetErrorDiv.textContent = errorMessage;
            resetErrorDiv.classList.remove("hidden");
        }
    })
    .catch(error => {
        console.error("Chi tiết lỗi đặt lại mật khẩu (lỗi mạng/server):", error);
        resetErrorDiv.classList.add("hidden");
        alert("Có lỗi xảy ra khi gửi yêu cầu đặt lại mật khẩu. Vui lòng kiểm tra kết nối và thử lại.");
    });

    return false;
}
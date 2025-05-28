// Hàm gọi API quên mật khẩu
function callForgotPassAPI(event) {
    event.preventDefault(); // Ngăn form reload trang

    // Lấy giá trị từ form
    const email = document.getElementById("email").value.trim();
    // Lấy element hiển thị lỗi email
    const emailErrorDiv = document.getElementById("email-error");

    // Ẩn thông báo lỗi email trước khi kiểm tra
    emailErrorDiv.classList.add("hidden");
    emailErrorDiv.textContent = ""; // Xóa nội dung lỗi cũ

    // Kiểm tra dữ liệu đầu vào (chỉ cần email)
    if (!email) {
        emailErrorDiv.textContent = "Vui lòng nhập địa chỉ email!";
        emailErrorDiv.classList.remove("hidden");
        return false;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailErrorDiv.textContent = "Email không hợp lệ! Vui lòng nhập đúng định dạng email.";
        emailErrorDiv.classList.remove("hidden");
        return false;
    }

    console.log("Đang gửi yêu cầu quên mật khẩu:", { email });

    // Gọi API quên mật khẩu
    // Use the correct endpoint and method from the API doc
    fetch("https://tiemsachnhaem-be-mu.vercel.app/api/auth/forgot-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email
        })
    })
    .then(async res => { // Use async to use await res.json() or res.text()
        console.log("Trạng thái phản hồi:", res.status);
        
        if (res.ok) { // Status 200 OK
            // Phản hồi thành công, có thể có message trong body
            try {
                const data = await res.json(); // Cố gắng đọc JSON
                console.log("Dữ liệu phản hồi thành công:", data);
                alert(data.message || "Yêu cầu khôi phục mật khẩu đã được gửi thành công!");
            } catch (e) {
                // Nếu không parse được JSON, có thể server chỉ trả về status 200
                console.log("Phản hồi 200 nhưng không có JSON body.");
                alert("Yêu cầu khôi phục mật khẩu đã được gửi thành công!");
            }
            // Add redirection to quenMK2.html after successful request, passing email as URL parameter
            window.location.href = "../pages/quenMK2.html?email=" + encodeURIComponent(email);
        } else { // Status not 200 (e.g., 400, 500)
            const errorText = await res.text(); // Đọc body lỗi dạng text
            console.error("Chi tiết lỗi phản hồi:", errorText);

            let errorMessage = `Yêu cầu khôi phục mật khẩu thất bại (${res.status}).`;
            try {
                // Cố gắng parse body lỗi dạng JSON để lấy thông báo chi tiết
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Nếu body lỗi không phải JSON, dùng thông báo chung
            }

            // Hiển thị lỗi trên giao diện hoặc alert tùy theo loại lỗi/mã status
            if (res.status === 400) { // Ví dụ: "Email không tồn tại"
                 alert(errorMessage);
                 emailErrorDiv.classList.add("hidden"); // Ensure div is hidden when using alert
            } else { // Lỗi server hoặc lỗi khác
                 alert(errorMessage); // Dùng alert cho lỗi không phải 400
                 emailErrorDiv.classList.add("hidden"); // Ẩn div lỗi trên form nếu dùng alert
            }
        }
    })
    .catch(error => {
        console.error("Chi tiết lỗi quên mật khẩu (lỗi mạng/server):", error);
        // Ẩn div lỗi trên trang
        emailErrorDiv.classList.add("hidden");
        // Hiển thị lỗi mạng/server trong alert box
        alert("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng kiểm tra kết nối và thử lại.");
    });

    return false;
}
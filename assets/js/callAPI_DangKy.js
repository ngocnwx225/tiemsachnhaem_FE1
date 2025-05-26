function callRegisterAPI(event) {
  event.preventDefault(); // Ngăn reload

  const fullName = document.getElementById("fullName").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const usernameErrorDiv = document.getElementById("username-error");
  const passwordErrorDiv = document.getElementById("password-error");

  // Ẩn tất cả thông báo lỗi trước khi kiểm tra
  usernameErrorDiv.classList.add("hidden");
  passwordErrorDiv.classList.add("hidden");

  if (!fullName || !username || !password) {
    // Nếu backend yêu cầu userName, có thể sinh từ email hoặc fullName
    // const userName = email.split('@')[0];
    alert("Vui lòng điền đầy đủ thông tin!");
    return false;
  }

  // Kiểm tra tên đăng nhập: ít nhất 8 ký tự, bao gồm chữ và số
  const usernameRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$/;
  if (!usernameRegex.test(username)) {
    usernameErrorDiv.textContent = "Tên đăng nhập không hợp lệ! Phải có ít nhất 8 ký tự, bao gồm chữ và số.";
    usernameErrorDiv.classList.remove("hidden");
    return false;
  }

  // Kiểm tra mật khẩu: ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/; // Regex theo yêu cầu từ ảnh OCR
  if (!passwordRegex.test(password)) {
    // Nội dung thông báo lỗi mật khẩu đã được cập nhật trực tiếp trong HTML
    passwordErrorDiv.classList.remove("hidden");
    return false;
  }

  console.log("Attempting to register user:", { fullName, UserName: username, Password: password }); // Log trước khi fetch

  fetch("https://tiemsachnhaem-be-mu.vercel.app/api/user_logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fullName: fullName,
      UserName: username, // Mengirim nilai username với key UserName theo API mới
      Password: password // Mengirim nilai password với key Password theo API mới
    })
  })
  .then(res => {
    console.log("Received response:", res); // Log phản hồi
    if (!res.ok) {
      console.error("HTTP error! status:", res.status); // Log lỗi HTTP
      return res.text().then(text => { // Thử đọc phản hồi dạng text để debug
        console.error("Error response body:", text);
        throw new Error("Đăng ký thất bại: " + res.status + (text ? " - " + text : ""));
      });
    }
    return res.json();
  })
  .then(data => {
    console.log("Registration successful:", data); // Log dữ liệu thành công
    alert("Đăng ký thành công!");
    window.location.href = "../pages/dangnhap1.html";
  })
  .catch(error => {
    console.error("Registration error:", error); // Log lỗi chung
    alert("Đăng ký thất bại. Vui lòng thử lại.");
  });

  return false;
}

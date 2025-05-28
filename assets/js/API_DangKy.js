function callRegisterAPI(event) {
    event.preventDefault(); // Ngăn reload
  
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
  
    const emailErrorDiv = document.getElementById("email-error");
    const passwordErrorDiv = document.getElementById("password-error");
  
    // Ẩn tất cả thông báo lỗi trước khi kiểm tra
    emailErrorDiv.classList.add("hidden");
    passwordErrorDiv.classList.add("hidden");
  
    if (!fullName || !email || !password) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return false;
    }
  
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailErrorDiv.textContent = "Email không hợp lệ! Vui lòng nhập đúng định dạng email.";
      emailErrorDiv.classList.remove("hidden");
      return false;
    }
  
    // Kiểm tra mật khẩu: ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      passwordErrorDiv.classList.remove("hidden");
      return false;
    }
  
    console.log("Attempting to register user:", { fullName, email, password });
  
    fetch("https://tiemsachnhaem-be-mu.vercel.app/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: fullName,
        email: email,
        password: password
      })
    })
    .then(res => {
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      
      if (!res.ok) {
        return res.text().then(text => {
          console.error("Error response body:", text);
          throw new Error(`Đăng ký thất bại (${res.status}): ${text}`);
        });
      }
      return res.json();
    })
    .then(data => {
      console.log("Response data:", data);
      // Nếu có data.success và nó là false thì mới throw error
      if (data && data.success === false) {
        throw new Error(data.message || "Đăng ký không thành công");
      }
      // Nếu thành công thì hiển thị thông báo và chuyển trang
      alert("Đăng ký thành công!");
      window.location.href = "../pages/dangnhap1.html";
    })
    .catch(error => {
      console.error("Registration error details:", error);
      alert(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
    });
  
    return false;
  }
  
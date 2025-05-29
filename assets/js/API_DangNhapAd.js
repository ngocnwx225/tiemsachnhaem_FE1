document.addEventListener("DOMContentLoaded", function () {
  // Gán sự kiện submit cho form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", callLoginAPI);
  }
});

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
    passwordError.textContent =
      "Email không hợp lệ! Vui lòng nhập đúng định dạng email.";
    passwordError.classList.remove("hidden");
    return false;
  }

  // Kiểm tra mật khẩu: ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
  if (!passwordRegex.test(password)) {
    passwordError.textContent =
      "Mật khẩu không hợp lệ! Phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.";
    passwordError.classList.remove("hidden");
    return false;
  }

  console.log("Đang gửi yêu cầu đăng nhập:", { email });

  // Gọi API đăng nhập
  fetch("https://tiemsachnhaem-be-mu.vercel.app/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((res) => {
      console.log("Trạng thái phản hồi:", res.status);

      if (!res.ok) {
        return res.text().then((text) => {
          console.error("Chi tiết lỗi:", text);
          throw new Error(`Đăng nhập thất bại (${res.status}): ${text}`);
        });
      }
      return res.json();
    })
    .then((data) => {
      console.log("Dữ liệu phản hồi:", data);

      // Nếu có dữ liệu phản hồi và thông tin user trong phản hồi
      if (data && data.user) {
        // Kiểm tra role của người dùng
        if (data.user.role === "admin") {
          console.log("Người dùng có role:", data.user.role);
          // Lưu thông tin người dùng vào localStorage
          localStorage.setItem("userInfo", JSON.stringify(data.user));
          console.log("Đã lưu thông tin người dùng:", data.user);
          alert("Đăng nhập thành công!");
          // Chuyển hướng đến trang chủ (hoặc trang admin)
          window.location.href = "../pages/index.html"; // Bạn có thể đổi sang trang admin nếu có
        } else {
          // Nếu role không phải admin
          console.warn("Người dùng không có quyền truy cập:", data.user.role);
          alert("Bạn không có quyền đăng nhập vào trang này");
          // Đảm bảo không lưu thông tin user không có quyền
          localStorage.removeItem("userInfo");
          passwordError.classList.add("hidden"); // Ẩn thông báo lỗi nếu có
        }
      } else {
        console.error("Phản hồi thành công nhưng dữ liệu user không hợp lệ:", data);
        alert("Đăng nhập không thành công: Không nhận được thông tin người dùng.");
        passwordError.classList.add("hidden");
      }
    })
    .catch((error) => {
      console.error("Chi tiết lỗi đăng nhập (lỗi mạng/server):", error); // Log chi tiết lỗi bắt được
      // Ẩn div lỗi trên trang
      document.getElementById("password-error").classList.add("hidden");
      // Kiểm tra nếu lỗi là từ phản hồi server 4xx/5xx đã xử lý
      if (error.message.startsWith("Đăng nhập thất bại")) {
        alert(error.message);
      } else {
        alert("Đăng nhập thất bại do lỗi kết nối hoặc server. Vui lòng thử lại.");
      }
    });

  return false;
}
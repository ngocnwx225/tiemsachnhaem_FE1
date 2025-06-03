document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".changepw-form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const email = userInfo.email;
    const newPassword = document.getElementById("new-password").value.trim();
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const confirmPassword = document
      .getElementById("confirm-password")
      .value.trim();

    if (!email) {
      alert("Không tìm thấy email người dùng. Vui lòng đăng nhập lại.");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    if (!passwordRegex.test(newPassword)) {
      passwordError.textContent =
        "Mật khẩu không hợp lệ! Phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.";
      passwordError.classList.remove("hidden");
      return false;
    }

    if (!newPassword || !confirmPassword) {
      confirmPasswordError.textContent = "Vui lòng điền đầy đủ mật khẩu";
      passwordError.textContent = "Vui lòng điền đầy đủ mật khẩu";
      passwordError.classList.remove("hidden");
      confirmPasswordError.classList.remove("hidden");
      return false;
    }

    if (newPassword !== confirmPassword) {
      passwordError.classList.add("hidden");
      confirmPasswordError.textContent = "Mật khẩu xác nhận không khớp!";
      confirmPasswordError.classList.remove("hidden");
      return false;
    }

    try {
      const response = await fetch(
        "https://tiemsachnhaem-be-mu.vercel.app/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Đổi mật khẩu thành công!");
        window.location.href = "../pages/profile.html";
      } else {
        alert(data.message || "Email không tồn tại hoặc lỗi đổi mật khẩu.");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Không thể kết nối đến máy chủ.");
    }
  });
});

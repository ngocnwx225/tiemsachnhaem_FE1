function anHienPass() {
      const passInput = document.getElementById('password');
      const eyeIcon = document.querySelector('.eye-icon');
      if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeIcon.src = '../assets/Hình/eye-slash.jpg'; // Đổi sang icon ẩn
        eyeIcon.alt = 'Ẩn mật khẩu';
      } else {
        passInput.type = 'password';
        eyeIcon.src = '../assets/Hình/view.png'; // Đổi sang icon hiện
        eyeIcon.alt = 'Hiện mật khẩu';
      }
    }

// Hàm tùy chỉnh thông báo lỗi cho các trường bắt buộc
function setRequiredError(input, message) {
  if (!input.value.trim()) {
    input.setCustomValidity(message); // Đặt thông báo khi trường trống
  } else {
    input.setCustomValidity(''); // Xóa thông báo nếu có nội dung
  }
  input.addEventListener('input', function() {
    if (!this.value.trim()) {
      this.setCustomValidity(message); // Đặt lại thông báo khi xóa nội dung
    } else {
      this.setCustomValidity(''); // Xóa thông báo khi có nội dung
    }
  });
}

// Hàm tùy chỉnh thông báo lỗi cho email
function setEmailError(input) {
  const email = input.value.trim();
  if (!email) {
    input.setCustomValidity('Vui lòng nhập địa chỉ email!');
  } else if (!email.includes('@')) {
    input.setCustomValidity('Vui lòng nhập địa chỉ email hợp lệ (phải chứa ký tự @)!');
  } else {
    // Kiểm tra định dạng email cơ bản (có @ và phần tên miền)
    const emailParts = email.split('@');
    if (emailParts.length !== 2 || !emailParts[1].includes('.')) {
      input.setCustomValidity('Vui lòng nhập địa chỉ email hợp lệ (phải có tên miền như .com hoặc .vn)!');
    } else {
      input.setCustomValidity(''); // Email hợp lệ
    }
  }
  input.addEventListener('input', function() {
    const currentEmail = this.value.trim();
    if (!currentEmail) {
      this.setCustomValidity('Vui lòng nhập địa chỉ email!');
    } else if (!currentEmail.includes('@')) {
      this.setCustomValidity('Vui lòng nhập địa chỉ email hợp lệ (phải chứa ký tự @)!');
    } else {
      const emailParts = currentEmail.split('@');
      if (emailParts.length !== 2 || !emailParts[1].includes('.')) {
        this.setCustomValidity('Vui lòng nhập địa chỉ email hợp lệ (phải có tên miền như .com hoặc .vn)!');
      } else {
        this.setCustomValidity(''); // Xóa thông báo nếu hợp lệ
      }
    }
  });
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.nextElementSibling;

  if (input.type === "password") {
    input.type = "text";
    icon.src = "../assets/Hình/eye-slash.jpg";
    icon.alt = "Ẩn mật khẩu";
  } else {
    input.type = "password";
    icon.src = "../assets/Hình/view.png";
    icon.alt = "Hiện mật khẩu";
  }
}
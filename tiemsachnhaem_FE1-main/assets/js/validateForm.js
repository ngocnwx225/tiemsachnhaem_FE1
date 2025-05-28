function validateForm(event) {
  event.preventDefault(); // Ngăn gửi biểu mẫu

  // Lấy giá trị đầu vào
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Kiểm tra xem có trường nào bị bỏ trống không
  if (!fullName || !email || !password) {
    alert('Vui lòng nhập đầy đủ họ tên, email và mật khẩu!');
    return false;
  }

  // Nếu tất cả đều hợp lệ, cho phép xử lý tiếp
  alert('Đăng ký thành công!');
  // Bỏ ghi chú dòng dưới để cho phép gửi biểu mẫu thực sự
  // document.getElementById('registerForm').submit();
  return true;
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
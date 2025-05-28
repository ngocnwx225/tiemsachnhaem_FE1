function myfunction() {
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

  // Áp dụng kiểm tra khi trang tải
  document.addEventListener('DOMContentLoaded', function() {
    const emailOrPhoneInput = document.getElementById('emailOrPhone');
    const passwordInput = document.getElementById('password');
    setRequiredError(passwordInput, 'Vui lòng nhập mật khẩu!');
    setEmailOrPhoneError(emailOrPhoneInput);
  });

function validateForm(event) {
event.preventDefault();

const form = event.target;
const isRegister = form.id === 'registerForm';
const email = document.getElementById('email').value.trim();
const password = document.getElementById('password').value.trim();
const passwordError = document.getElementById('password-error');

passwordError.classList.add('hidden');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// ---------------- Form Đăng ký ----------------
if (isRegister) {
  const fullName = document.getElementById('fullName').value.trim();

  if (!fullName || !email || !password) {
    passwordError.textContent = 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu!';
    passwordError.classList.remove('hidden');
    return false;
  }

  if (!passwordRegex.test(password)) {
    passwordError.textContent = 'Mật khẩu không hợp lệ! Phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.';
    passwordError.classList.remove('hidden');
    return false;
  }

  alert('Đăng ký thành công!');
} 

// ---------------- Form Đăng nhập ----------------
else {
  if (!email || !password) {
    passwordError.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu!';
    passwordError.classList.remove('hidden');
    return false;
  }

  if (!passwordRegex.test(password)) {
    passwordError.textContent = 'Mật khẩu không hợp lệ! Phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.';
    passwordError.classList.remove('hidden');
    return false;
  }

  alert('Đăng nhập thành công!');
}

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

function handleForgotPassword(event) {
event.preventDefault();

const emailInput = document.getElementById('email');
const email = emailInput.value.trim();
const errorBox = document.getElementById('email-error');

// Ẩn lỗi trước
errorBox.classList.add('hidden');

// Kiểm tra email rỗng
if (!email) {
  errorBox.textContent = 'Vui lòng nhập địa chỉ email!';
  errorBox.classList.remove('hidden');
  emailInput.focus();
  return false;
}

// Kiểm tra định dạng email
const emailParts = email.split('@');
if (!email.includes('@') || emailParts.length !== 2 || !emailParts[1].includes('.')) {
  errorBox.textContent = 'Vui lòng nhập địa chỉ email hợp lệ!';
  errorBox.classList.remove('hidden');
  emailInput.focus();
  return false;
}

// Nếu hợp lệ → chuyển trang
window.location.href = '../pages/quenMK2.html';
return false;
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

function validateResetPassword() {
const pass1 = document.getElementById('pass1').value.trim();
const pass2 = document.getElementById('pass2').value.trim();
const errorBox = document.getElementById('reset-error');

errorBox.classList.add('hidden');

if (!pass1 || !pass2) {
  errorBox.textContent = 'Vui lòng nhập đầy đủ mật khẩu!';
  errorBox.classList.remove('hidden');
  return;
}

if (pass1 !== pass2) {
  errorBox.textContent = 'Mật khẩu xác nhận không khớp';
  errorBox.classList.remove('hidden');
  return;
}

    // Nếu hợp lệ
window.location.href = '../pages/quenMK3.html';
}

function handleSubmit(event) {
event.preventDefault(); // Ngăn reload trang

const isValid = validateForm(event); // gọi hàm kiểm tra dữ liệu

if (isValid) {
  callRegisterAPI(event); // gọi API nếu dữ liệu hợp lệ
}

return false; // Ngăn submit mặc định
}
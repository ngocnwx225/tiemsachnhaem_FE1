document.addEventListener('DOMContentLoaded', function() {
    const editCustomerForm = document.getElementById('editCustomerForm');

    if (editCustomerForm) {
        editCustomerForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Lấy giá trị từ các trường input
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();

            // Kiểm tra cơ bản
            if (!fullName) {
                alert('Vui lòng nhập họ và tên.');
                document.getElementById('fullName').focus();
                return;
            }
            if (!email) {
                alert('Vui lòng nhập email.');
                document.getElementById('email').focus();
                return;
            }
            if (!isValidEmail(email)) {
                alert('Địa chỉ email không hợp lệ.');
                document.getElementById('email').focus();
                return;
            }
            if (!phone) {
                alert('Vui lòng nhập số điện thoại.');
                document.getElementById('phone').focus();
                return;
            }
            if (!isValidPhone(phone)) {
                alert('Số điện thoại không hợp lệ. (Yêu cầu: 10-11 chữ số)');
                document.getElementById('phone').focus();
                return;
            }

            // Lưu thông tin vào localStorage (giả lập, có thể thay bằng API)
            const userData = {
                fullName,
                email,
                phone
            };
            localStorage.setItem('userProfile', JSON.stringify(userData));

            // Hiển thị thông báo thành công
            alert('Lưu thông tin thành công');

            // Chuyển về trang thông tin tài khoản
            window.location.href = 'profilecustomer.html';
        });
    }

    // Hàm kiểm tra định dạng email đơn giản
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Hàm kiểm tra định dạng số điện thoại (10-11 chữ số)
    function isValidPhone(phone) {
        const phoneRegex = /^\d{10,11}$/;
        return phoneRegex.test(phone);
    }
});
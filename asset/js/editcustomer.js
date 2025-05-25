document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật năm hiện tại cho footer (nếu footer của bạn có id="currentYear")
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const editCustomerForm = document.getElementById('editCustomerForm');

    if (editCustomerForm) {
        editCustomerForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Ngăn chặn hành vi submit mặc định của form

            // Lấy giá trị từ các trường input
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();

            // Kiểm tra cơ bản (bạn có thể thêm các kiểm tra phức tạp hơn)
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

            // Mô phỏng việc gửi dữ liệu lên server
            console.log('Đang lưu thông tin (mô phỏng):');
            console.log('Họ và tên:', fullName);
            console.log('Email:', email);
            console.log('Số điện thoại:', phone);

            // Hiển thị thông báo thành công (mô phỏng)
            alert('Thông tin của bạn đã được cập nhật thành công! (Mô phỏng)');

            // (Tùy chọn) Chuyển hướng người dùng sau khi lưu
            // Ví dụ: window.location.href = 'profilecustomer.html';
        });
    }

    // Hàm kiểm tra định dạng email đơn giản
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Hàm kiểm tra định dạng số điện thoại (ví dụ: 10-11 chữ số)
    function isValidPhone(phone) {
        const phoneRegex = /^\d{10,11}$/;
        return phoneRegex.test(phone);
    }

    // (Tùy chọn) Nếu bạn dùng JavaScript để tải header/footer
    // Ví dụ hàm load HTML components (yêu cầu file loadComponents.js hoặc code tương tự)
    /*
    function loadHTMLComponent(componentPath, placeholderId) {
        fetch(componentPath)
            .then(response => response.ok ? response.text() : Promise.reject('Không tải được component: ' + componentPath))
            .then(data => {
                document.getElementById(placeholderId).innerHTML = data;
            })
            .catch(error => console.error('Lỗi khi tải component:', error));
    }

    loadHTMLComponent('header.html', 'header-placeholder');
    loadHTMLComponent('footer.html', 'footer-placeholder');
    */
});

// ----- JavaScript cho profilecustomer.html (để chuyển trang) -----
// Bạn cần đặt đoạn mã này vào file JS của trang profilecustomer.html
// hoặc trong thẻ <script> của trang đó.
/*
document.addEventListener('DOMContentLoaded', function() {
    const editInfoButton = document.getElementById('ID_CUA_NUT_CHINH_SUA_THONG_TIN'); // Thay bằng ID thật của nút
    if (editInfoButton) {
        editInfoButton.addEventListener('click', function() {
            window.location.href = 'editcustomer.html';
        });
    }
});
*/
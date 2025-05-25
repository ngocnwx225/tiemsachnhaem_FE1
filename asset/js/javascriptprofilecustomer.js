document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const accountSidebarButtons = document.querySelectorAll('.account-sidebar .sidebar-btn');

    if (mobileMenuToggle && mobileNav) {
        mobileMenuToggle.addEventListener('click', function () {
            if (mobileNav.style.display === 'flex') {
                mobileNav.style.display = 'none';
            } else {
                mobileNav.style.display = 'flex';
            }
        });
    }

    accountSidebarButtons.forEach((button, idx) => {
        button.addEventListener('click', function() {
            // Remove 'active' class from all buttons
            accountSidebarButtons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked button
            this.classList.add('active');

            // Nếu là nút "Đổi mật khẩu"
            if (this.textContent.trim() === 'Đổi mật khẩu') {
                window.location.href = 'changepassword.html';
            }
            // Nếu là nút "Thông tin tài khoản"
            else if (this.textContent.trim() === 'Thông tin tài khoản') {
                window.location.href = 'profilecustomer.html';
            }
        });
    });

    const editBtn = document.querySelector('.edit-info-btn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            window.location.href = '../pages/editcustomer.html';
        });
    }

});
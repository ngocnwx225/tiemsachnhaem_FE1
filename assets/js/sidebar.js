// Xử lý tương tác với sidebar
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý active menu item dựa trên trang hiện tại
    highlightCurrentPage();
    
    // Xử lý sự kiện đăng xuất
    setupLogout();
    
    // Hiển thị thông tin người dùng nếu đã đăng nhập
    displayUserInfo();

    // Xử lý hiệu ứng hover cho các menu items
    setupMenuHoverEffects();
});

// Đánh dấu mục đang được chọn trên sidebar
function highlightCurrentPage() {
    // Lấy đường dẫn đầy đủ
    const fullPath = window.location.pathname;
    
    // Lấy tên file từ đường dẫn (phần cuối cùng sau dấu /)
    let pageName = fullPath.split('/').pop();
    
    // Nếu không có tên file (chỉ có '/' ở cuối), coi như là trang chủ
    if (!pageName) {
        pageName = 'index.html';
    }
    
    console.log("Current page:", pageName);
    
    // Highlight menu dựa trên trang hiện tại
    if (pageName.includes('index.html') || pageName === '') {
        highlightMenuItem('menu-overview');
    } else if (pageName.includes('pages/adminQLSP.html')) {
        highlightMenuItem('menu-products');
    } else if (pageName.includes('quanlydonhang.html')) {
        highlightMenuItem('menu-orders');
    } else if (pageName.includes('pages/QLKH.html')) {
        highlightMenuItem('menu-customers');
    } else if (pageName.includes('statistics.html')) {
        highlightMenuItem('menu-statistics');
    }
}

// Highlight một menu item cụ thể
function highlightMenuItem(menuId) {
    // Xóa trạng thái active từ tất cả các mục
    document.querySelectorAll('.menu li').forEach(item => {
        item.classList.remove('active');
        item.style.backgroundColor = '';
        item.style.color = '#555';
        item.style.fontWeight = '500';
        item.style.boxShadow = '';
    });
    
    // Thêm trạng thái active cho mục tương ứng
    const menuItem = document.getElementById(menuId);
    if (menuItem) {
        menuItem.classList.add('active');
        menuItem.style.backgroundColor = '#f9e8ea';
        menuItem.style.color = '#333';
        menuItem.style.fontWeight = 'bold';
        menuItem.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)';
        console.log("Activated menu item:", menuId);
    } else {
        console.log("Menu item not found:", menuId);
    }
}

// Thiết lập sự kiện đăng xuất
function setupLogout() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        // Thêm hiệu ứng hover
        logoutButton.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#d32f2f';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 12px rgba(244, 67, 54, 0.4)';
        });
        
        logoutButton.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#f44336';
            this.style.transform = '';
            this.style.boxShadow = '0 4px 8px rgba(244, 67, 54, 0.3)';
        });
        
        // Thêm hiệu ứng khi click
        logoutButton.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
            this.style.boxShadow = '0 2px 4px rgba(244, 67, 54, 0.3)';
        });
        
        logoutButton.addEventListener('mouseup', function() {
            this.style.transform = '';
            this.style.boxShadow = '0 4px 8px rgba(244, 67, 54, 0.3)';
        });
        
        // Chức năng đăng xuất - chuyển đến trang đăng nhập
        logoutButton.addEventListener('click', function() {
            // Thêm hiệu ứng trước khi chuyển trang
            this.style.backgroundColor = '#b71c1c';
            this.style.transform = 'scale(0.95)';
            
            // Xóa session hoặc local storage nếu cần
            localStorage.removeItem('user');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('userToken');
            sessionStorage.removeItem('user');
            
            // Xác định đường dẫn tới trang đăng nhập
            let loginUrl;
            const currentUrl = window.location.href;
            
            // Nếu URL chứa 'pages/', chúng ta đang ở trong thư mục con
            if (currentUrl.includes('/pages/')) {
                loginUrl = 'dangnhap1.html'; // Nếu đang ở trong thư mục pages
            } 
            // Nếu URL chứa admin hoặc quản trị viên, chúng ta có thể đang ở admin dashboard
            else if (currentUrl.includes('/admin/') || currentUrl.includes('/quantrivien/')) {
                loginUrl = '../pages/dangnhap1.html'; // Lên một cấp từ thư mục admin
            } 
            // Mặc định, giả sử chúng ta đang ở root
            else {
                loginUrl = 'pages/dangnhap1.html'; // Đến thư mục pages từ root
            }
            
            // Chuyển đến trang đăng nhập sau 300ms để hiển thị hiệu ứng
            setTimeout(function() {
                window.location.href = loginUrl;
            }, 300);
        });
    }
}

// Hiển thị thông tin người dùng từ localStorage
function displayUserInfo() {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            
            // Hiển thị tên người dùng nếu có
            if (user.fullName) {
                const accountName = document.querySelector('.profile-section div:nth-child(2)');
                if (accountName) {
                    accountName.textContent = user.fullName;
                }
            }
            
            // Hiển thị vai trò người dùng
            if (user.role) {
                const accountRole = document.querySelector('.profile-section div:nth-child(3) b');
                if (accountRole) {
                    accountRole.textContent = user.role.toUpperCase();
                }
            }
        } catch (error) {
            console.error('Lỗi khi hiển thị thông tin người dùng:', error);
        }
    }
}

// Thiết lập hiệu ứng hover cho các menu items
function setupMenuHoverEffects() {
    const menuItems = document.querySelectorAll('.menu li');
    
    menuItems.forEach(item => {
        // Style cho hover
        item.addEventListener('mouseover', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = '#f9e8ea';
                this.style.transform = 'translateX(5px)';
                this.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)';
            }
        });
        
        item.addEventListener('mouseout', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = '';
                this.style.transform = '';
                this.style.boxShadow = '';
            }
        });
    });
} 
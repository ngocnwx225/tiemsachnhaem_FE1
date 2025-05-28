// Xử lý tương tác với sidebar
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý active menu item dựa trên trang hiện tại
    highlightCurrentPage();
    
    // Xử lý sự kiện đăng xuất
    setupLogout();
    
    // Hiển thị thông tin người dùng nếu đã đăng nhập
    displayUserInfo();
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
    } else if (pageName.includes('adminQLSP.html')) {
        highlightMenuItem('menu-products');
    } else if (pageName.includes('quanlydonhang.html')) {
        highlightMenuItem('menu-orders');
    } else if (pageName.includes('QLKH.html')) {
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
    });
    
    // Thêm trạng thái active cho mục tương ứng
    const menuItem = document.getElementById(menuId);
    if (menuItem) {
        menuItem.classList.add('active');
        console.log("Activated menu item:", menuId);
    } else {
        console.log("Menu item not found:", menuId);
    }
}

// Thiết lập sự kiện đăng xuất
function setupLogout() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        // Chức năng đăng xuất - chuyển đến trang đăng nhập
        logoutButton.addEventListener('click', function() {
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
                loginUrl = '../pages/dangnhap1.html'; // Từ thư mục pages đến thư mục pages
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
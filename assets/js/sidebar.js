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
    
    // Map tên trang với các mục menu
    const pageToMenuMap = {
        // Trang chính
        'index.html': 'menu-overview',
        
        // Trang quản lý sản phẩm
        'adminQLSP.html': 'menu-products',
        
        // Trang quản lý đơn hàng
        'quanlydonhang.html': 'menu-orders',
        
        // Trang quản lý khách hàng
        'QLKH.html': 'menu-customers',
        
        // Trang thống kê
        'statistics.html': 'menu-statistics',
        
        // Các mapping phụ
        'sanpham.html': 'menu-products',
        'thongke.html': 'menu-statistics',
        'dashboard.html': 'menu-overview'
    };
    
    // Xóa trạng thái active từ tất cả các mục
    document.querySelectorAll('.menu li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Thêm trạng thái active cho mục tương ứng
    const menuId = pageToMenuMap[pageName];
    
    // Thêm trạng thái active cho mục tương ứng
    if (menuId) {
        const menuItem = document.getElementById(menuId);
        if (menuItem) {
            menuItem.classList.add('active');
            console.log("Activated menu item:", menuId);
        } else {
            console.log("Menu item not found:", menuId);
        }
    } else {
        console.log("No menu mapping for page:", pageName);
    }
}

// Thiết lập sự kiện đăng xuất
function setupLogout() {
    const logoutButton = document.querySelector('.logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Xóa thông tin người dùng trong localStorage
            localStorage.removeItem('userInfo');
            localStorage.removeItem('userToken');
            
            // Lấy đường dẫn tới trang hiện tại
            const currentUrl = window.location.href;
            const urlParts = currentUrl.split('/');
            
            // Xác định vị trí tương đối của trang đăng nhập
            let loginUrl;
            
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
            
            console.log("Đăng xuất, chuyển hướng đến:", loginUrl);
            window.location.href = loginUrl;
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
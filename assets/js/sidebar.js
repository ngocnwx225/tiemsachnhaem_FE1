// Xử lý tương tác với sidebar
document.addEventListener('DOMContentLoaded', function() {
    // Tải sidebar
    loadSidebar();
    
    // Xử lý active menu item dựa trên trang hiện tại
    highlightCurrentPage();
    
    // Xử lý sự kiện đăng xuất
    setupLogout();
    
    // Hiển thị thông tin người dùng nếu đã đăng nhập
    displayUserInfo();
});

// Tải sidebar và xử lý đường dẫn
function loadSidebar() {
    const sidebarContainer = document.getElementById("sidebar-container");
    if (!sidebarContainer) return;
    
    // Xác định đường dẫn tới sidebar.html dựa trên vị trí trang hiện tại
    const currentPath = window.location.pathname;
    let sidebarPath;
    
    // Nếu đang ở trong thư mục pages
    if (currentPath.includes("/pages/")) {
        sidebarPath = "../components/sidebar.html";
    } else {
        sidebarPath = "components/sidebar.html";
    }
    
    // Tải sidebar
    fetch(sidebarPath)
        .then(res => res.text())
        .then(data => {
            sidebarContainer.innerHTML = data;
            
            // Fix các đường dẫn trong sidebar nếu cần
            document.querySelectorAll("#sidebar-container a, #sidebar-container img").forEach(el => {
                const src = el.getAttribute("src") || el.getAttribute("href");
                if (src && !src.startsWith("http")) {
                    // Nếu đang ở trong thư mục pages và đường dẫn không bắt đầu bằng ../
                    if (currentPath.includes("/pages/") && !src.startsWith("../")) {
                        if (el.tagName === "IMG") {
                            el.src = "../" + src;
                        } else {
                            el.href = "../" + src;
                        }
                    }
                }
            });
            
            // Điều chỉnh vị trí của sidebar để nằm sát lề trái
            const sidebarElement = document.querySelector("#sidebar-container .sidebar");
            if (sidebarElement) {
                sidebarElement.style.position = "fixed";
                sidebarElement.style.left = "0";
                sidebarElement.style.top = "0";
                sidebarElement.style.height = "100vh";
                sidebarElement.style.overflow = "visible";
            }
            
            // Highlight menu item phù hợp sau khi tải sidebar
            highlightCurrentPage();
        })
        .catch(error => {
            console.error("Lỗi khi tải sidebar:", error);
        });
}

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
        logoutButton.addEventListener('click', function(e) {
            // Ngăn chặn hành vi mặc định của onclick inline (nếu có)
            e.preventDefault();
            
            // Xác định đường dẫn đến trang đăng nhập dựa trên vị trí hiện tại
            const currentPath = window.location.pathname;
            let loginPath;
            
            // Nếu đang ở trang chính (root)
            if (currentPath.endsWith("index.html") || currentPath === "/" || currentPath.endsWith("/")) {
                loginPath = "pages/dangnhap1.html";
            } 
            // Nếu đang ở trong thư mục pages
            else if (currentPath.includes("/pages/")) {
                loginPath = "../pages/dangnhap1.html";
            }
            // Trường hợp khác
            else {
                loginPath = "pages/dangnhap1.html";
            }
            
            console.log("Chuyển hướng đến:", loginPath);
            // Chuyển hướng đến trang đăng nhập
            window.location.href = loginPath;
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
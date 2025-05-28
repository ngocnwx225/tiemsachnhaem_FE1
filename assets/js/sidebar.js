// Xử lý tương tác với sidebar
document.addEventListener('DOMContentLoaded', function() {
    // Tải sidebar
    loadSidebar();
    
    // Xử lý active menu item dựa trên trang hiện tại
    highlightCurrentPage();
    
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
                sidebarElement.style.left = "0";
                sidebarElement.style.top = "0";
                sidebarElement.style.overflow = "visible";
            }
            
            // Highlight menu item phù hợp sau khi tải sidebar
            highlightCurrentPage();
            
            // Thiết lập sự kiện đăng xuất sau khi sidebar được tải
            setupLogout();
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
    console.log("Setting up logout button...");
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        console.log("Logout button found, attaching event listener");
        logoutButton.addEventListener('click', function(e) {
            console.log("Logout button clicked");
            // Ngăn chặn hành vi mặc định của onclick inline (nếu có)
            e.preventDefault();
            
            // Xóa thông tin người dùng khỏi localStorage
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            
            // Chuyển hướng đến trang đăng nhập
            const currentPath = window.location.pathname;
            
            // Nếu đang trong thư mục pages
            if (currentPath.includes("/pages/")) {
                window.location.href = "dangnhap1.html";
            } else {
                // Nếu ở root hoặc nơi khác
                window.location.href = "pages/dangnhap1.html";
            }
            
            console.log("Đăng xuất thành công");
        });
    } else {
        console.log("Logout button not found!");
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
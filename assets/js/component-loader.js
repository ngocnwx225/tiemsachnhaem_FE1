// Component Loader
document.addEventListener('DOMContentLoaded', function() {
  // Tìm đường dẫn gốc của trang web
  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/');
  const isInSubfolder = pathSegments.includes('pages');
  
  // Xác định đường dẫn đến components và assets
  const basePath = isInSubfolder ? '..' : '.';
  
  // Load header component với đường dẫn phù hợp
  fetch(`${basePath}/components/header.html`)
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;

      // User dropdown menu functionality
      const userIcon = document.querySelector('.fa-user');
      const dropdown = document.querySelector('.dropdown-menu');

      if (userIcon && dropdown) {
        userIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          dropdown.classList.toggle('show');
        });

        document.addEventListener('click', function(e) {
          if (!userIcon.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
          }
        });
      }
      
      // Profile and Logout buttons functionality
      const profileBtn = document.querySelector('.profile-btn');
      const logoutBtn = document.querySelector('.logout-btn');
      
      if (profileBtn) {
        profileBtn.addEventListener('click', function() {
          window.location.href = `${basePath}/pages/profilecustomer.html`;
        });
      }
      
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
          console.log('Đăng xuất');
          localStorage.removeItem('userInfo');
          localStorage.getItem("cart") && localStorage.removeItem("cart");
          localStorage.getItem("isDiscountApplied") && localStorage.removeItem("isDiscountApplied");
          const isLogout = confirm('Bạn có muốn đăng xuất không?');
          if (isLogout) {
            alert('Đăng xuất thành công');
            window.location.href = `${basePath}/pages/dangnhap1.html`;
          }
        });
      }

      // Search functionality
      const searchInput = document.getElementById('search-input');
      const searchIcon = document.getElementById('search-icon');
      const searchResults = document.getElementById('search-results');

      // Kiểm tra xem các phần tử tìm kiếm có tồn tại không
      if (!searchInput || !searchIcon || !searchResults) {
        console.error('Không tìm thấy phần tử tìm kiếm');
        return;
      }

      // Debounce function to limit API calls
      function debounce(func, delay) {
        let debounceTimer;
        return function() {
          const context = this;
          const args = arguments;
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
      }

      // Khởi tạo cache để lưu trữ sản phẩm đã tải
      let productsCache = [];

      // Function để lấy tất cả sản phẩm một lần và lưu vào cache
      async function fetchAllProducts() {
        try {
          // Tải tất cả sản phẩm nếu cache trống
          if (productsCache.length === 0) {
            const response = await fetch('https://tiemsachnhaem-be-mu.vercel.app/api/products?limit=50');
            if (!response.ok) {
              throw new Error('Không thể tải danh sách sản phẩm');
            }
            const data = await response.json();
            productsCache = data.products || [];
          }
          return productsCache;
        } catch (error) {
          console.error('Lỗi khi tải sản phẩm:', error);
          return [];
        }
      }

      // Function to perform search
      async function performSearch() {
        const keyword = searchInput.value.trim().toLowerCase();
        
        if (!keyword) {
          searchResults.classList.remove('show');
          searchResults.innerHTML = '';
          return;
        }

        try {
          // Show loading indicator
          searchResults.innerHTML = '<p style="padding: 10px; color: #666;">Đang tìm kiếm...</p>';
          searchResults.classList.add('show');

          // Lấy sản phẩm từ cache hoặc API
          const allProducts = await fetchAllProducts();
          
          // Tìm kiếm sản phẩm theo từ khóa
          const matchedProducts = allProducts.filter(product => {
            return (
              product.bookTitle && product.bookTitle.toLowerCase().includes(keyword) ||
              product.author && product.author.toLowerCase().includes(keyword) ||
              product.description && product.description.toLowerCase().includes(keyword) ||
              product.catalog && product.catalog.toLowerCase().includes(keyword)
            );
          });
          
          // Clear previous results
          searchResults.innerHTML = '';
          
          if (matchedProducts && matchedProducts.length > 0) {
            // Display search results
            matchedProducts.slice(0, 5).forEach(product => {
              const resultItem = document.createElement('a');
              resultItem.classList.add('search-result-item');
              resultItem.href = `${basePath}/pages/DetailProduct.html?id=${product._id}`;
              
              // Format price with thousands separator
              const formattedPrice = product.price?.toLocaleString('vi-VN') || 'N/A';
              
              resultItem.innerHTML = `
                <img src="${product.imageUrl || `${basePath}/assets/images/default-book.jpg`}" alt="${product.bookTitle}">
                <div>
                  <p class="product-name">${product.bookTitle || 'Không có tên'}</p>
                  <p class="product-price">${formattedPrice}đ</p>
                </div>
              `;
              searchResults.appendChild(resultItem);
            });
            
            // Add "Xem tất cả" option if there are more than 5 results
            if (matchedProducts.length > 5) {
              const viewAllItem = document.createElement('a');
              viewAllItem.classList.add('search-result-item', 'view-all');
              viewAllItem.href = `${basePath}/pages/ShopPage.html?search=${encodeURIComponent(keyword)}`;
              viewAllItem.innerHTML = `
                <div style="width: 100%; text-align: center; padding: 10px; color: #86A788; font-weight: 500;">
                  <p>Xem tất cả ${matchedProducts.length} kết quả</p>
                </div>
              `;
              searchResults.appendChild(viewAllItem);
            }
          } else {
            // No results found
            searchResults.innerHTML = '<p style="padding: 10px; color: #666;">Không tìm thấy sản phẩm.</p>';
          }
        } catch (error) {
          console.error('Lỗi tìm kiếm sản phẩm:', error);
          searchResults.innerHTML = '<p style="padding: 10px; color: #666;">Đã có lỗi xảy ra.</p>';
        }
      }

      // Search when typing (with debounce)
      const debouncedSearch = debounce(performSearch, 300);
      searchInput.addEventListener('input', debouncedSearch);

      // Search on Enter key press
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performSearch();
        }
      });

      // Search on search icon click
      searchIcon.addEventListener('click', performSearch);

      // Close search results when clicking outside
      document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !searchIcon.contains(e.target)) {
          searchResults.classList.remove('show');
        }
      });

      // Clear results when input is cleared
      searchInput.addEventListener('input', function() {
        if (!searchInput.value.trim()) {
          searchResults.classList.remove('show');
          searchResults.innerHTML = '';
        }
      });
    })
    .catch(error => console.error('Error loading header:', error));

  // Load footer component
  fetch(`${basePath}/components/footer.html`)
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));
});
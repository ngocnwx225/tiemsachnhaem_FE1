// Component Loader
document.addEventListener('DOMContentLoaded', function() {
  // Load header component
  fetch('../components/header.html')
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
          window.location.href = '../pages/profilecustomer.html';
        });
      }
      
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
          console.log('Đăng xuất');
          localStorage.removeItem('userInfo');
          const isLogout = confirm('Bạn có muốn đăng xuất không?');
          if (isLogout) {
            alert('Đăng xuất thành công');
            window.location.href = '../pages/dangnhap1.html';
          }
        });
      }

      // Search functionality
      const searchInput = document.getElementById('search-input');
      const searchIcon = document.getElementById('search-icon');
      const searchResults = document.getElementById('search-results');

      function performSearch() {
        const keyword = searchInput.value.trim().toLowerCase();
        if (!keyword) {
          searchResults.classList.remove('show');
          searchResults.innerHTML = '';
          return;
        }

        // Fetch products from ShopPage
        fetch('../pages/ShopPage.html')
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const products = doc.querySelectorAll('.product-item');

            searchResults.innerHTML = '';
            let hasResults = false;

            products.forEach(product => {
              const name = product.querySelector('.product-name')?.textContent.toLowerCase() || '';
              const price = product.querySelector('.product-price')?.textContent || '';
              const img = product.querySelector('img')?.src || '';

              if (name.includes(keyword)) {
                hasResults = true;
                const resultItem = document.createElement('a');
                resultItem.classList.add('search-result-item');
                resultItem.href = '../pages/ShopPage.html'; 
                resultItem.innerHTML = `
                  <img src="${img}" alt="${name}">
                  <div>
                    <p class="product-name">${product.querySelector('.product-name')?.textContent || 'Không có tên'}</p>
                    <p class="product-price">${price}</p>
                  </div>
                `;
                searchResults.appendChild(resultItem);
              }
            });

            if (hasResults) {
              searchResults.classList.add('show');
            } else {
              searchResults.innerHTML = '<p style="padding: 10px; color: #666;">Không tìm thấy sản phẩm.</p>';
              searchResults.classList.add('show');
            }
          })
          .catch(error => {
            console.error('Error fetching ShopPage:', error);
            searchResults.innerHTML = '<p style="padding: 10px; color: #666;">Đã có lỗi xảy ra.</p>';
            searchResults.classList.add('show');
          });
      }

      // Search input event listeners
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performSearch();
        }
      });

      searchIcon.addEventListener('click', performSearch);

      // Close search results when clicking outside
      document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !searchIcon.contains(e.target)) {
          searchResults.classList.remove('show');
          searchResults.innerHTML = '';
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
  fetch('../components/footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));
});
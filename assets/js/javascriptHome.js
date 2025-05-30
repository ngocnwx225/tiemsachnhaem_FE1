document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM đã được tải và phân tích hoàn tất. Đang chạy javascriptHome.js");
    const carousels = document.querySelectorAll(".carousel-wrapper");
    console.log(`Đã tìm thấy ${carousels.length} carousel wrapper.`);
  
    carousels.forEach(wrapper => {
      const bookList = wrapper.querySelector(".book-list");
      const prevBtn = wrapper.querySelector(".prev");
      const nextBtn = wrapper.querySelector(".next");
  
      console.log("Đang xử lý một carousel wrapper:");
      console.log("  Đã tìm thấy bookList:", !!bookList);
      console.log("  Đã tìm thấy prevBtn:", !!prevBtn);
      console.log("  Đã tìm thấy nextBtn:", !!nextBtn);
  
      // Tính toán khoảng cách cuộn cho một thẻ + một khoảng trống
      const cardWidth = 281.25;
      const gapWidth = 16; // 1rem
      const scrollAmount = cardWidth + gapWidth;
  
      // Đảm bảo các nút tồn tại trước khi thêm trình xử lý sự kiện
      if (prevBtn) {
          console.log("Đang thêm trình xử lý sự kiện click cho prevBtn.");
          prevBtn.addEventListener("click", () => {
              console.log("Đã nhấn nút Prev.");
              bookList.scrollBy({ left: -scrollAmount, behavior: "smooth" });
          });
      }
  
      if (nextBtn) {
          console.log("Đang thêm trình xử lý sự kiện click cho nextBtn.");
          nextBtn.addEventListener("click", () => {
              console.log("Đã nhấn nút Next.");
              bookList.scrollBy({ left: scrollAmount, behavior: "smooth" });
          });
      }

      // Hàm để hiển thị thẻ sản phẩm
      function renderProducts(productsToRender) {
          console.log(`Đang hiển thị ${productsToRender.length} sản phẩm.`);
          bookList.innerHTML = ''; // Xóa các sản phẩm hiện có

          if (productsToRender.length === 0) {
              bookList.innerHTML = '<p>Không tìm thấy sản phẩm nào.</p>';
              return;
          }

          productsToRender.forEach(p => {
              const card = document.createElement('div');
              card.className = 'product-card';
              // Sử dụng cấu trúc từ product-card.html nhưng điều chỉnh cho trang chủ
              card.innerHTML = `
                  <div class="product-image-container">
                      <img class="product-image" src="${p.imageUrl || 'https://placehold.co/150x220'}" alt="${p.bookTitle}" data-id="${p._id}">
                  </div>
                  <div class="product-info">
                      <div class="product-title">${p.bookTitle}</div>
                      <div class="product-price">${p.price?.toLocaleString('vi-VN') || 'N/A'}<span class="product-price-unit">đ</span></div>
                      <div class="product-sold">${p.soldCount || 0} đã bán/tháng</div>
                      <div class="product-actions">
                          <button class="buy-button" data-id="${p._id}" data-title="${p.bookTitle}" data-price="${p.price}" data-image="${p.imageUrl}">Mua hàng</button>
                          <div class="cart-button" data-id="${p._id}" data-title="${p.bookTitle}" data-price="${p.price}" data-image="${p.imageUrl}">
                              <svg class="cart-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7.5 7.67001V6.70001C7.5 4.45001 9.31 2.24001 11.56 2.03001C14.24 1.77001 16.5 3.88001 16.5 6.51001V7.89001" stroke="#86A788" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M8.99999 22H15C19.02 22 19.74 20.39 19.95 18.43L20.7 12.43C20.97 9.99 20.27 8 16 8H7.99999C3.72999 8 3.02999 9.99 3.29999 12.43L4.04999 18.43C4.25999 20.39 4.97999 22 8.99999 22Z" stroke="#86A788" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M15.5 12H15.51" stroke="#86A788" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M8.5 12H8.51" stroke="#86A788" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                          </div>
                      </div>
                  </div>
              `;
              bookList.appendChild(card);
          });

          // Thêm trình xử lý sự kiện sau khi hiển thị
          addEventListenersToProducts();
      }

      // Hàm để thêm trình xử lý sự kiện cho các sản phẩm mới được hiển thị
      function addEventListenersToProducts() {
          // Thêm sự kiện cho hình ảnh sản phẩm (chuyển đến DetailProduct.html)
          bookList.querySelectorAll('.product-image').forEach(image => {
              image.addEventListener('click', function () {
                  const productId = this.getAttribute('data-id');
                  window.location.href = `DetailProduct.html?id=${productId}`;
              });
          });

          // Thêm sự kiện cho các nút "Mua hàng"
          bookList.querySelectorAll('.buy-button').forEach(button => {
              button.addEventListener('click', function () {
                  const product = {
                      id: this.getAttribute('data-id'),
                      bookTitle: this.getAttribute('data-title'),
                      price: parseInt(this.getAttribute('data-price')),
                      imageUrl: this.getAttribute('data-image'),
                      quantity: 1
                  };

                  let cart = JSON.parse(localStorage.getItem('cart')) || [];
                  const existingProduct = cart.find(item => item.id === product.id);
                  if (existingProduct) {
                      existingProduct.quantity += 1;
                  } else {
                      cart.push(product);
                  }
                  localStorage.setItem('cart', JSON.stringify(cart));
                  window.location.href = 'cart.html'; // Chuyển hướng đến trang giỏ hàng sau khi mua
              });
          });

          // Thêm sự kiện cho các nút "Thêm vào giỏ hàng"
          bookList.querySelectorAll('.cart-button').forEach(button => {
              button.addEventListener('click', function () {
                  const product = {
                      id: this.getAttribute('data-id'),
                      bookTitle: this.getAttribute('data-title'),
                      price: parseInt(this.getAttribute('data-price')),
                      imageUrl: this.getAttribute('data-image'),
                      quantity: 1
                  };

                  let cart = JSON.parse(localStorage.getItem('cart')) || [];
                  const existingProduct = cart.find(item => item.id === product.id);
                  if (existingProduct) {
                      existingProduct.quantity += 1;
                  } else {
                      cart.push(product);
                  }
                  localStorage.setItem('cart', JSON.stringify(cart));
                  // Tùy chọn: Hiển thị thông báo khi sản phẩm được thêm vào giỏ hàng
                  console.log(`${product.bookTitle} added to cart`);

                  // Hiển thị modal thông báo
                  showNotificationModal(`${product.bookTitle} đã được thêm vào giỏ hàng!`);
              });
          });
      }

      // Hàm hiển thị modal
      function showNotificationModal(message) {
          const modal = document.getElementById('cartNotificationModal');
          const messageElement = document.getElementById('notificationMessage');
          if (!modal || !messageElement) {
              console.error('Modal hoặc message element không tồn tại');
              return;
          }
          messageElement.textContent = message;
          modal.style.display = 'flex';
      }

      // Hàm ẩn modal
      function closeNotificationModal() {
          const modal = document.getElementById('cartNotificationModal');
          if (modal) modal.style.display = 'none';
      }

      // Thêm event listener để đóng modal khi click vào nút Đóng
      const closeModalBtn = document.getElementById('closeModalBtn');
      if (closeModalBtn) {
          closeModalBtn.addEventListener('click', closeNotificationModal);
      }

      // Thêm event listener để đóng modal khi click ra ngoài modal
      const cartNotificationModal = document.getElementById('cartNotificationModal');
      if (cartNotificationModal) {
          cartNotificationModal.addEventListener('click', function (e) {
              if (e.target === this) {
                  closeNotificationModal();
              }
          });
      }

      // Lấy sản phẩm, sắp xếp theo soldCount, và hiển thị top 10
      fetch('https://tiemsachnhaem-be-mu.vercel.app/api/products?page=1&limit=50') // Lấy nhiều hơn 10 để đảm bảo
          .then(res => res.json())
          .then(data => {
              const products = data.products || [];
              // Sắp xếp theo soldCount giảm dần
              products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
              // Lấy top 10
              const top10Products = products.slice(0, 10);
              renderProducts(top10Products);
          })
          .catch(err => {
              console.error('Lỗi gọi API:', err);
              bookList.innerHTML = '<p>Không thể tải danh sách sản phẩm.</p>';
          });
    });

    // Thêm trình xử lý sự kiện cho nút 'Xem tất cả'
    const seeAllButton = document.querySelector('.see-all-btn');
    if (seeAllButton) {
        seeAllButton.addEventListener('click', function() {
            window.location.href = 'shoppage.html'; // Giả sử shoppage.html nằm trong cùng thư mục
        });
    }
});
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed. Running javascriptHome.js");
    const carousels = document.querySelectorAll(".carousel-wrapper");
    console.log(`Found ${carousels.length} carousel wrappers.`);
  
    carousels.forEach(wrapper => {
      const bookList = wrapper.querySelector(".book-list");
      const prevBtn = wrapper.querySelector(".prev");
      const nextBtn = wrapper.querySelector(".next");
  
      console.log("Processing a carousel wrapper:");
      console.log("  bookList found:", !!bookList);
      console.log("  prevBtn found:", !!prevBtn);
      console.log("  nextBtn found:", !!nextBtn);
  
      // Calculate scroll amount for one card + one gap
      const cardWidth = 281.25;
      const gapWidth = 16; // 1rem
      const scrollAmount = cardWidth + gapWidth;
  
      // Ensure buttons exist before adding listeners
      if (prevBtn) {
          console.log("Adding click listener to prevBtn.");
          prevBtn.addEventListener("click", () => {
              console.log("Prev button clicked.");
              bookList.scrollBy({ left: -scrollAmount, behavior: "smooth" });
          });
      }
  
      if (nextBtn) {
          console.log("Adding click listener to nextBtn.");
          nextBtn.addEventListener("click", () => {
              console.log("Next button clicked.");
              bookList.scrollBy({ left: scrollAmount, behavior: "smooth" });
          });
      }

      // Function to render product cards
      function renderProducts(productsToRender) {
          console.log(`Rendering ${productsToRender.length} products.`);
          bookList.innerHTML = ''; // Clear existing products

          if (productsToRender.length === 0) {
              bookList.innerHTML = '<p>Không tìm thấy sản phẩm nào.</p>';
              return;
          }

          productsToRender.forEach(p => {
              const card = document.createElement('div');
              card.className = 'product-card';
              // Using the structure from product-card.html but adapted for home page
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

          // Add event listeners after rendering
          addEventListenersToProducts();
      }

      // Function to add event listeners to newly rendered products
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
                  window.location.href = 'cart.html'; // Redirect to cart page after buying
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
                  // Optional: Show a notification that item was added to cart
                  console.log(`${product.bookTitle} added to cart`);
              });
          });
      }

      // Fetch products, sort by soldCount, and render top 10
      fetch('https://tiemsachnhaem-be-mu.vercel.app/api/products?page=1&limit=50') // Fetch more than 10 to be safe
          .then(res => res.json())
          .then(data => {
              const products = data.products || [];
              // Sort by soldCount descending
              products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
              // Get top 10
              const top10Products = products.slice(0, 10);
              renderProducts(top10Products);
          })
          .catch(err => {
              console.error('Lỗi gọi API:', err);
              bookList.innerHTML = '<p>Không thể tải danh sách sản phẩm.</p>';
          });
    });

    // Add event listener for 'Xem tất cả' button
    const seeAllButton = document.querySelector('.see-all-btn');
    if (seeAllButton) {
        seeAllButton.addEventListener('click', function() {
            window.location.href = 'shoppage.html'; // Assuming shoppage.html is in the same directory
        });
    }
});
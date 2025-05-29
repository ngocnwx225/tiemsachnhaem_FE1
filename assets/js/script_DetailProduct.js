document.addEventListener("DOMContentLoaded", async function () {
  // ✅ THÊM HTML modal vào trang
  const notificationHtml = `
    <div id="cartNotificationModal" class="modal" style="display: none;">
      <div class="modal-content success-content">
        <div class="modal-header">
          <i class="fas fa-check-circle" style="color: #52c41a;"></i>
          <h2>Thành công</h2>
        </div>
        <div class="modal-body">
          <p id="notificationMessage"></p>
        </div>
        <div class="modal-footer">
          <button class="btn-confirm" id="closeModalBtn">Đóng</button>
        </div>
      </div>
    </div>
    <div id="cartNotificationText" style="display: none;"></div>
  `;
  document.body.insertAdjacentHTML('beforeend', notificationHtml);

  // ✅ Hàm hiển thị modal
  function showNotificationModal(message) {
    const modal = document.getElementById('cartNotificationModal');
    const messageElement = document.getElementById('notificationMessage');
    messageElement.textContent = message;
    modal.style.display = 'flex';
  }

  // ✅ Hàm ẩn modal
  window.closeNotificationModal = function () {
    const modal = document.getElementById('cartNotificationModal');
    modal.style.display = 'none';
  };

  // ✅ Click ngoài để đóng
  document.getElementById('cartNotificationModal').addEventListener('click', function (e) {
    if (e.target === this) {
      closeNotificationModal();
    }
  });

  // ✅ Click nút đóng để ẩn
  document.getElementById('closeModalBtn').addEventListener('click', closeNotificationModal);

  
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  try {
    const productRes = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/products/${id}`);
    const productData = await productRes.json();

    // Hiển thị chi tiết sách
    document.querySelector("#book-image").src = productData.imageUrl;
    document.querySelector("#book-title").innerHTML = productData.bookTitle;
    document.querySelector("#book-price").textContent = productData.price.toLocaleString('vi-VN') + 'đ';
    document.querySelector("#book-stock").textContent = `Đã bán: ${productData.soldCount || 0}`;
    document.querySelector("#book-isbn").textContent = productData.ISBN;
    document.querySelector("#book-publisher").textContent = productData.publisher;
    document.querySelector("#book-author").textContent = productData.author;
    document.querySelector("#book-pages").textContent = productData.pageCount;
    document.querySelector("#book-catalog").textContent = productData.catalog || 'Không rõ';
    document.querySelector("#book-desc").textContent = productData.description;

    // Load sách cùng thể loại
    if (productData.catalog) {
      await loadRelatedBooks(productData.catalog, productData._id); 
    }
    
    // Load sách bán chạy
    await loadTopSellingBooks();
    attachCartAndBuyEvents()
    
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết sách:", err);
  }
  
});

document.addEventListener("DOMContentLoaded", async function () {
  
  const params = new URLSearchParams(window.location.search);
  const currentId = params.get("id");
  if (!currentId) return;

  try {
    // Bước 1: Gọi API lấy thông tin sản phẩm hiện tại
    const res = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/products/${currentId}`);
    if (!res.ok) throw new Error("Không tìm thấy sản phẩm");

    const currentBook = await res.json();
    const catalog = currentBook.catalog;

    // Bước 2: Gọi API lấy danh sách sách cùng catalog
    await loadRelatedBooks(catalog, currentId);
  } catch (err) {
    console.error("Lỗi khi tải sách hiện tại hoặc sách liên quan:", err);
  }
});

async function loadRelatedBooks(catalog, currentId) {
  try {
    // Sử dụng API /products/catalog/{catalog} thay vì /products/by-catalog/{catalog}
    const res = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/products/catalog/${encodeURIComponent(catalog)}?limit=10`);
    const books = await res.json();
    const container = document.getElementById("related-books-list");
    container.innerHTML = '';

    if (!Array.isArray(books) || books.length === 0) {
      console.log("Không có sách liên quan hoặc dữ liệu không phải mảng");
      return;
    }

    books
      .filter(book => book._id !== currentId) // loại trừ chính nó
      .slice(0, 5) // Giới hạn 10 sách
      .forEach(book => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <div class="product-image-container">
            <img class="product-image" src="${book.imageUrl || ''}" alt="${book.bookTitle}" data-id="${book._id}">
          </div>
          <div class="product-info">
            <div class="product-title">${book.bookTitle}</div>
            <div class="product-price">${book.price?.toLocaleString('vi-VN') || 'N/A'}<span class="product-price-unit">đ</span></div>
            <div class="product-sold">${book.soldCount || 0} đã bán/tháng</div>
            <div class="product-actions">
              <button class="buy-button" data-id="${book._id}" data-title="${book.bookTitle}" data-price="${book.price}" data-image="${book.imageUrl}">Mua hàng</button>
              <div class="cart-button" data-id="${book._id}" data-title="${book.bookTitle}" data-price="${book.price}" data-image="${book.imageUrl}">
              <svg class="cart-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 7.67001V6.70001C7.5 4.45001 9.31 2.24001 11.56 2.03001C14.24 1.77001 16.5 3.88001 16.5 6.51001V7.89001" stroke="#86A788" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.99999 22H15C19.02 22 19.74 20.39 19.95 18.43L20.7 12.43C20.97 9.99 20.27 8 16 8H7.99999C3.72999 8 3.02999 9.99 3.29999 12.43L4.04999 18.43C4.25999 20.39 4.97999 22 8.99999 22Z" stroke="#86A788" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15.5 12H15.51" stroke="#86A788" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.5 12H8.51" stroke="#86A788" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            </div>
          </div>
          </div>
        `;
        card.querySelector('.product-image').addEventListener('click', () => {
          window.location.href = `DetailProduct.html?id=${book._id}`;
        });

      container.appendChild(card);
      
    });

  } catch (err) {
    console.error("Lỗi khi load sách cùng thể loại:", err);
  }
}

async function loadTopSellingBooks() {
  try {
    const res = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/products/top-selling?limit=10`);
    const books = await res.json();

    // Tìm container cho sách nổi bật
    const container = document.querySelector(".popular-books .book-list");
    container.innerHTML = '';

    if (!Array.isArray(books) || books.length === 0) {
      console.log("Không có sách bán chạy hoặc dữ liệu không phải mảng");
      return;
    }
    

    books
    .slice(0, 5)
    .forEach(book => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-image-container">
          <img class="product-image" src="${book.imageUrl || ''}" alt="${book.bookTitle}" data-id="${book._id}">
        </div>
        <div class="product-info">
          <div class="product-title">${book.bookTitle}</div>
          <div class="product-price">${book.price?.toLocaleString('vi-VN') || 'N/A'}<span class="product-price-unit">đ</span></div>
          <div class="product-sold">${book.soldCount || 0} đã bán/tháng</div>
          <div class="product-actions">
            <button class="buy-button" data-id="${book._id}" data-title="${book.bookTitle}" data-price="${book.price}" data-image="${book.imageUrl}">Mua hàng</button>
            <div class="cart-button" data-id="${book._id}" data-title="${book.bookTitle}" data-price="${book.price}" data-image="${book.imageUrl}">
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
      card.querySelector('.product-image').addEventListener('click', () => {
        window.location.href = `DetailProduct.html?id=${book._id}`;
      });

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Lỗi khi load sách bán chạy:", err);
  }
}

function attachCartAndBuyEvents() {
  // Nút Mua hàng
  document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', function () {
      const product = {
        id: this.getAttribute('data-id'),
        bookTitle: this.getAttribute('data-title'),
        price: parseInt(this.getAttribute('data-price')),
        imageUrl: this.getAttribute('data-image'),
        quantity: 1,
        checked: true
      };

      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingProduct = cart.find(item => item.id === product.id);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.push(product);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.location.href = 'cart.html';
    });
  });

  // Nút Thêm vào giỏ hàng
  document.querySelectorAll('.cart-button').forEach(button => {
    button.addEventListener('click', function () {
      const product = {
        id: this.getAttribute('data-id'),
        bookTitle: this.getAttribute('data-title'),
        price: parseInt(this.getAttribute('data-price')),
        imageUrl: this.getAttribute('data-image'),
        quantity: 1,
        checked: true
      };

      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingProduct = cart.find(item => item.id === product.id);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.push(product);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      showNotificationModal(`${product.bookTitle} đã được thêm vào giỏ hàng!`);
      showCartNotificationText(product.bookTitle);
    });
  });
}
window.showNotificationModal = function (message) {
  const modal = document.getElementById('cartNotificationModal');
  const messageElement = document.getElementById('notificationMessage');
  if (!modal || !messageElement) return;
  messageElement.textContent = message;
  modal.style.display = 'flex';
};

window.showCartNotificationText = function (message) {
  const notificationText = document.getElementById('cartNotificationText');
  if (!notificationText) return;
  notificationText.textContent = `Sản phẩm đã được thêm vào giỏ hàng: ${message}`;
  notificationText.style.display = 'block';
  setTimeout(() => {
    notificationText.style.display = 'none';
  }, 5000);
};

// Đóng mở dấu +/−
function toggleBox(header) {
  const icon = header.querySelector(".icon");
  const subContent = header.nextElementSibling;

  icon.textContent = icon.textContent.trim() === "+" ? "−" : "+";
  subContent.style.display =
    subContent.style.display === "none" || !subContent.style.display
      ? "block"
      : "none";
}

// Mở tất cả box khi load
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".sub-header").forEach((header) => {
    const icon = header.querySelector(".icon");
    const subContent = header.nextElementSibling;
    subContent.style.display = "block";
    icon.textContent = "−";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const tagsContainer = document.querySelector(".tags-container");
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const clearButton = document.querySelector(".delete-button");
  const priceRange = document.getElementById("price-range");
  const maxPrice = parseInt(priceRange.max);
  let priceTag = null;
  let products = [];
  let filteredProducts = [];

  // Thêm HTML cho modal thông báo và thông báo text
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
  document
    .querySelector("main")
    .insertAdjacentHTML("beforeend", notificationHtml);

  // Hàm hiển thị modal thông báo
  function showNotificationModal(message) {
    const modal = document.getElementById("cartNotificationModal");
    const messageElement = document.getElementById("notificationMessage");
    messageElement.textContent = message;
    modal.style.display = "flex";
  }

  // Hàm đóng modal
  window.closeNotificationModal = function () {
    const modal = document.getElementById("cartNotificationModal");
    modal.style.display = "none";
  };

  // Đóng modal khi nhấp bên ngoài
  document
    .getElementById("cartNotificationModal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        closeNotificationModal();
      }
    });

  // Đóng modal khi nhấp vào nút "Đóng"
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeNotificationModal);

  // Hàm hiển thị thông báo text bên dưới danh sách sản phẩm
  function showCartNotificationText(message) {
    const notificationText = document.getElementById("cartNotificationText");
    notificationText.textContent = `Sản phẩm đã được thêm vào giỏ hàng: ${message}`;
    notificationText.style.display = "block";
    setTimeout(() => {
      notificationText.style.display = "none";
    }, 5000);
  }

  function formatCurrency(value) {
    return value.toLocaleString("vi-VN") + "đ";
  }

  function createTag(label, value) {
    if (tagsContainer.querySelector(`[data-value="${value}"]`)) return;

    const tag = document.createElement("span");
    tag.className = "filter-tag";
    tag.setAttribute("data-value", value);
    tag.innerHTML = `${label} <span class="remove">×</span>`;

    tag.querySelector(".remove").addEventListener("click", () => {
      tag.remove();
      const cb = document.querySelector(
        `input[type="checkbox"][value="${value}"]`
      );
      if (cb) cb.checked = false;
      applyFilters();
    });

    tagsContainer.appendChild(tag);
  }

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", function () {
      const value = this.value;
      const label = this.parentElement.textContent.trim();

      if (this.checked) {
        createTag(label, value);
      } else {
        const tag = tagsContainer.querySelector(`[data-value="${value}"]`);
        if (tag) tag.remove();
      }
    });
  });

  priceRange.addEventListener("input", () => {
    const currentValue = parseInt(priceRange.value);
    if (priceTag) priceTag.remove();

    if (currentValue < maxPrice) {
      const formatted = formatCurrency(currentValue);
      priceTag = document.createElement("span");
      priceTag.className = "filter-tag";
      priceTag.setAttribute("data-type", "price");
      priceTag.innerHTML = `0đ - ${formatted} <span class="remove">×</span>`;

      priceTag.querySelector(".remove").addEventListener("click", () => {
        priceTag.remove();
        priceTag = null;
        priceRange.value = maxPrice;
        applyFilters();
      });

      tagsContainer.appendChild(priceTag);
    }
  });

  clearButton.addEventListener("click", () => {
    tagsContainer
      .querySelectorAll(".filter-tag")
      .forEach((tag) => tag.remove());
    checkboxes.forEach((cb) => (cb.checked = false));
    priceRange.value = maxPrice;
    if (priceTag) {
      priceTag.remove();
      priceTag = null;
    }
    applyFilters();
  });

  function renderProducts(list) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    if (list.length === 0) {
      grid.innerHTML =
        '<p class="no-product">Không tìm thấy sản phẩm phù hợp.</p>';
      return;
    }

    list.forEach((p) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-image-container">
          <img class="product-image" src="${
            p.imageUrl || "https://placehold.co/120x182"
          }" alt="${p.bookTitle}" data-id="${p._id}">
        </div>
        <div class="product-info">
          <div class="product-title">${p.bookTitle}</div>
          <div class="product-price">${
            p.price?.toLocaleString("vi-VN") || "N/A"
          }<span class="product-price-unit">đ</span></div>
          <div class="product-sold">${p.soldCount || 0} đã bán/tháng</div>
          <div class="product-actions">
            <button class="buy-button" data-id="${p._id}" data-title="${
        p.bookTitle
      }" data-price="${p.price}" data-image="${p.imageUrl}">Mua hàng</button>
            <div class="cart-button" data-id="${p._id}" data-title="${
        p.bookTitle
      }" data-price="${p.price}" data-image="${p.imageUrl}">
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
      grid.appendChild(card);
    });

    // Thêm sự kiện cho hình ảnh sản phẩm (chuyển đến DetailProduct.html)
    document.querySelectorAll(".product-image").forEach((image) => {
      image.addEventListener("click", function () {
        const productId = this.getAttribute("data-id");
        window.location.href = `DetailProduct.html?id=${productId}`;
      });
    });

    // Thêm sự kiện cho các nút "Mua hàng"
    document.querySelectorAll(".buy-button").forEach((button) => {
      button.addEventListener("click", function () {
        const product = {
          id: this.getAttribute("data-id"),
          bookTitle: this.getAttribute("data-title"),
          price: parseInt(this.getAttribute("data-price")), // Đã ép kiểu
          imageUrl: this.getAttribute("data-image"),
          quantity: 1,
          checked: true,
        };

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingProduct = cart.find((item) => item.id === product.id);
        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.push(product);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        window.location.href = "cart.html";
      });
    });

    // Thêm sự kiện cho các nút "Thêm vào giỏ hàng"
    document.querySelectorAll(".cart-button").forEach((button) => {
      button.addEventListener("click", function () {
        const product = {
          id: this.getAttribute("data-id"),
          bookTitle: this.getAttribute("data-title"),
          price: parseInt(this.getAttribute("data-price")), // Đã ép kiểu
          imageUrl: this.getAttribute("data-image"),
          quantity: 1,
          checked: true,
        };

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingProduct = cart.find((item) => item.id === product.id);
        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.push(product);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        showNotificationModal(
          `${product.bookTitle} đã được thêm vào giỏ hàng!`
        );
        showCartNotificationText(product.bookTitle);
      });
    });
  }

  // Hàm áp dụng bộ lọc
  function applyFilters() {
    const checked = [
      ...document.querySelectorAll('input[type="checkbox"]:checked'),
    ].map((cb) => cb.value);
    const genreFilters = checked;
    const maxSelectedPrice = parseInt(priceRange.value);

    filteredProducts = products.filter((p) => {
      const genre = p.catalog || "";
      const price = p.price || 0;

      const matchGenre =
        genreFilters.length === 0 || genreFilters.includes(genre);
      const matchPrice = price <= maxSelectedPrice;

      return matchGenre && matchPrice;
    });

    applySort();
  }

  // Hàm áp dụng sắp xếp
  function applySort() {
    const sortValue = document.getElementById("sort-select").value;
    let sortedProducts = [...filteredProducts];

    switch (sortValue) {
      case "popular":
        sortedProducts.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case "az":
        sortedProducts.sort((a, b) => a.bookTitle.localeCompare(b.bookTitle));
        break;
      case "za":
        sortedProducts.sort((a, b) => b.bookTitle.localeCompare(b.bookTitle));
        break;
      case "price-asc":
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }

    renderProducts(sortedProducts);
  }

  // Gọi API khi load trang
  fetch("https://tiemsachnhaem-be-mu.vercel.app/api/products?page=1&limit=50")
    .then((res) => res.json())
    .then((data) => {
      // Ép kiểu price trong products
      products = data.products.map((product) => ({
        ...product,
        price: parseInt(product.price), // Ép kiểu price thành số
      }));
      filteredProducts = [...products];
      renderProducts(products);

      document
        .querySelector(".apply-button")
        .addEventListener("click", applyFilters);
      document
        .getElementById("sort-select")
        .addEventListener("change", applySort);
    })
    .catch((err) => {
      console.error("Lỗi gọi API:", err);
      document.getElementById("product-grid").innerHTML =
        '<p class="no-product">Không thể tải danh sách sản phẩm.</p>';
    });
});

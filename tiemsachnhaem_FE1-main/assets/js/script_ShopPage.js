// Đóng mở dấu +/−
function toggleBox(header) {
  const icon = header.querySelector('.icon');
  const subContent = header.nextElementSibling;

  icon.textContent = icon.textContent.trim() === '+' ? '−' : '+';
  subContent.style.display = (subContent.style.display === 'none' || !subContent.style.display) ? 'block' : 'none';
}

// Mở tất cả box khi load
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sub-header').forEach(header => {
    const icon = header.querySelector('.icon');
    const subContent = header.nextElementSibling;
    subContent.style.display = 'block';
    icon.textContent = '−';
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const tagsContainer = document.querySelector('.tags-container');
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const clearButton = document.querySelector('.delete-button');
  const priceRange = document.getElementById('price-range');
  const maxPrice = parseInt(priceRange.max);
  let priceTag = null;
  let products = [];

  function formatCurrency(value) {
    return value.toLocaleString('vi-VN') + 'đ';
  }

  function createTag(label, value) {
    if (tagsContainer.querySelector(`[data-value="${value}"]`)) return;

    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.setAttribute('data-value', value);
    tag.style.cssText = `
      background-color: #86aa84;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    `;
    tag.innerHTML = `${label} <span class="remove" style="cursor:pointer;">×</span>`;

    tag.querySelector('.remove').addEventListener('click', () => {
      tag.remove();
      const cb = document.querySelector(`input[type="checkbox"][value="${value}"]`);
      if (cb) cb.checked = false;
    });

    tagsContainer.appendChild(tag);
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', function () {
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

  priceRange.addEventListener('input', () => {
    const currentValue = parseInt(priceRange.value);
    if (priceTag) priceTag.remove();

    if (currentValue < maxPrice) {
      const formatted = formatCurrency(currentValue);
      priceTag = document.createElement('span');
      priceTag.className = 'filter-tag';
      priceTag.setAttribute('data-type', 'price');
      priceTag.innerHTML = `0đ - ${formatted} <span class="remove" style="cursor:pointer;">×</span>`;

      priceTag.querySelector('.remove').addEventListener('click', () => {
        priceTag.remove();
        priceTag = null;
        priceRange.value = maxPrice;
        renderProducts(products);
      });

      tagsContainer.appendChild(priceTag);
    }
  });

  clearButton.addEventListener('click', () => {
    tagsContainer.querySelectorAll('.filter-tag').forEach(tag => tag.remove());
    checkboxes.forEach(cb => cb.checked = false);
    priceRange.value = maxPrice;
    if (priceTag) {
      priceTag.remove();
      priceTag = null;
    }
    renderProducts(products);
  });

  function renderProducts(list) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    if (list.length === 0) {
      grid.innerHTML = '<p class="no-product">Không tìm thấy sản phẩm phù hợp.</p>';
      return;
    }

    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.imageUrl || 'https://via.placeholder.com/150x220'}" alt="${p.bookTitle}" class="product-img">
        <h4 class="product-title">${p.bookTitle}</h4>
        <p class="product-price">${p.price?.toLocaleString('vi-VN') || 'N/A'}đ</p>
        <div class="product-rating">
          <span class="sales">Sold: ${p.soldCount || 0} đã bán/tháng</span>
        </div>
        <div class="product-actions">
          <button class="buy-button">Mua hàng</button>
          <div class="cart-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Gọi API khi load trang
  fetch('https://tiemsachnhaem-be-mu.vercel.app/api/products?page=1&limit=50')
    .then(res => res.json())
    .then(data => {
      products = data.products;
      renderProducts(products);

      document.querySelector('.apply-button').addEventListener('click', () => {
        const checked = [...document.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);
        const genreFilters = checked.filter(v => isNaN(v));
        const ratingFilters = checked.filter(v => !isNaN(v)).map(Number);
        const maxSelectedPrice = parseInt(priceRange.value);

        const filtered = products.filter(p => {
          const genre = p.catalog || '';   // 🔥 dùng đúng field từ API
          const rating = p.rating || 4.0;
          const price = p.price || 0;

          const matchGenre = genreFilters.length === 0 || genreFilters.includes(genre);
          const matchRating = ratingFilters.length === 0 || ratingFilters.some(r => rating >= r);
          const matchPrice = price <= maxSelectedPrice;

          return matchGenre && matchRating && matchPrice;
        });

        renderProducts(filtered);
      });
    })
    .catch(err => {
      console.error('Lỗi gọi API:', err);
      document.getElementById('product-grid').innerHTML = '<p class="no-product">Không thể tải danh sách sản phẩm.</p>';
    });
});

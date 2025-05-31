document.addEventListener('DOMContentLoaded', () => {
  // Khi trang load lần đầu, gọi API với filter=1 (tuần)
  loadStatisticsAndOrders({ filter: '1' });
  loadTopSellingProducts();
  loadRecentOrders({});
});

// ==========================
// 1. Gọi API thống kê chính
// ==========================
function loadStatisticsAndOrders(data) {
  // Tạo URL với các tham số filter
  let url = `https://tiemsachnhaem-be-mu.vercel.app/api/orders/statistics`;

  // Thêm các tham số query nếu có
  const params = new URLSearchParams();
  if (data.filter) params.append('filter', data.filter);
  if (data.fromDate) params.append('fromDate', data.fromDate);
  if (data.toDate) params.append('toDate', data.toDate);

  // Thêm params vào URL nếu có
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  console.log('Gọi API với URL:', url);

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById('total-orders').textContent =
        data.totalOrders ?? 0;
      document.getElementById('new-orders').textContent =
        data.pendingOrders ?? 0;
      document.getElementById('total-customers').textContent =
        data.totalUsers ?? 0;
      document.getElementById('revenue').textContent = formatRevenue(
        data.totalRevenue ?? 0
      );
      renderRecentOrders(data.recentOrders?.slice(0, 3) || []);
    })
    .catch((err) => {
      console.error('Lỗi thống kê:', err);
      document.getElementById('recent-orders').textContent =
        'Không thể tải dữ liệu.';
    });
}

// ==========================
// 2. Gọi API top sản phẩm
// ==========================
// Gọi các sản phẩm bán chạy
async function loadTopSellingProducts() {
  console.log('🚀 Gọi loadTopSellingProducts()');

  try {
    const response = await fetch(
      'https://tiemsachnhaem-be-mu.vercel.app/api/products/top-selling?limit=4'
    );
    if (!response.ok) throw new Error('Lỗi khi lấy sản phẩm bán chạy');

    const data = await response.json();

    console.log('✅ Dữ liệu thô trả về:', data);
    const products = Array.isArray(data) ? data : data.data || [];
    console.log('📦 Danh sách sản phẩm:', products);

    const container = document.getElementById('top-products-list');
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
      container.innerHTML = '<p>Không có dữ liệu.</p>';
      return;
    }

    products.forEach((product) => {
      const productHTML = `
    <div style="display: flex; align-items: flex-start; margin-bottom: 16px; gap: 12px;">
      <img src="${product.imageUrl}" alt="${
        product.bookTitle
      }" width="40" height="60" style="object-fit: cover; border-radius: 4px;" />
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between;">
          <div>
            <div style="font-weight: 500;">${product.bookTitle}</div>
            <div style="font-size: 13px; color: #86a788; margin-top: 2px;">
              ${product.price.toLocaleString('vi-VN')} ₫
            </div>
          </div>
          <div style="font-size: 13px; color: #666; white-space: nowrap;">
            Đã bán: ${product.soldCount.toLocaleString('vi-VN')}
          </div>
        </div>
      </div>
    </div>
  `;
      container.innerHTML += productHTML;
    });
  } catch (error) {
    console.error('❌ Lỗi khi load top-selling products:', error);
  }
}

// ==========================
// 3. Đơn hàng gần đây
// ==========================
function renderRecentOrders(orders) {
  const container = document.getElementById('recent-orders');
  if (!orders.length) {
    container.innerHTML = 'Không có đơn hàng gần đây.';
    return;
  }

  container.innerHTML = orders
    .map(
      (order) => `
    <div class="order-item">
      <div class="order-left">
        <img src="../assets/images/Container.png" width="32" height="32" />
        <div class="order-info">
          <strong>${order.customerName}</strong>
          <span>${order.productCount} sản phẩm</span>
        </div>
      </div>
      <div class="order-dates">
        <span>Ngày đặt:</span> ${new Date(order.orderDate).toLocaleDateString(
          'vi-VN'
        )}
      </div>
      <div class="order-status">
        <div class="order-price">${formatCurrency(order.totalAmount)}</div>
        <div class="status">${order.status}</div>
      </div>
    </div>
  `
    )
    .join('');
}

// ==========================
// 4. Lọc thời gian (hiện tạm thời)
// ==========================
function loadRecentOrders(data) {
  console.log('⏳ Lọc đơn hàng theo:', data);
  loadStatisticsAndOrders({
    filter: data.filter,
    fromDate: data.fromDate,
    toDate: data.toDate,
  });
}

// ==========================
// 5. Nút chọn thời gian lọc
// ==========================
document.querySelectorAll('.time-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    console.log('Đã click vào nút:', btn.innerText.trim());

    // Xóa active class khỏi tất cả các nút và thêm vào nút hiện tại
    document
      .querySelectorAll('.time-btn')
      .forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const label = btn.innerText.trim().toLowerCase();
    console.log('Label được chọn:', label);

    let filter;
    if (label === 'tuần') {
      filter = '1';
    } else if (label === 'tháng') {
      filter = '2';
    } else if (label === 'năm') {
      filter = '3';
    }

    // Xử lý tùy chỉnh riêng
    if (label === 'tùy chỉnh') {
      document.getElementById('custom-date-range').style.display = 'block';
      return; // Không gọi API ngay, chờ người dùng chọn ngày và bấm lọc
    } else {
      document.getElementById('custom-date-range').style.display = 'none';

      console.log('Gọi API với filter:', filter);
      loadRecentOrders({
        filter,
        fromDate: undefined,
        toDate: undefined,
      });
    }
  });
});

document.getElementById('apply-filter').addEventListener('click', () => {
  const from = document.getElementById('from-date').value;
  const to = document.getElementById('to-date').value;

  if (!from || !to) {
    alert('Vui lòng chọn cả 2 ngày.');
    return;
  }

  loadRecentOrders({
    filter: undefined,
    fromDate: from,
    toDate: to,
  });
});

// ==========================
// 6. Format tiền tệ
// ==========================
function formatRevenue(amount) {
  const millions = (amount || 0) / 1_000_000;
  return `${millions.toFixed(1)}M`;
}

function formatCurrency(amount) {
  return (amount || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
}

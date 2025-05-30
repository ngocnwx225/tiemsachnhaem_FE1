// 1. Load sidebar từ file HTML
fetch("../components/sidebar.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("sidebar-container").innerHTML = data;

    // Cập nhật lại các đường dẫn tương đối
    document.querySelectorAll("#sidebar-container a, #sidebar-container img").forEach((el) => {
      const src = el.getAttribute("src") || el.getAttribute("href");
      if (src && !src.startsWith("http") && !src.startsWith("../")) {
        if (el.tagName === "IMG") el.src = "../" + src;
        else el.href = "../" + src;
      }
    });

    // Cố định sidebar
    const sidebarElement = document.querySelector("#sidebar-container .sidebar");
    if (sidebarElement) {
      sidebarElement.style.position = "fixed";
      sidebarElement.style.left = "0";
      sidebarElement.style.top = "0";
      sidebarElement.style.height = "100vh";
    }

    // Đánh dấu menu đang active
    document.getElementById("menu-statistics")?.classList.add("active");
  });

// ======================================
// 1. Load thống kê số đơn hàng theo trạng thái
// ======================================
async function loadOrderStatusStatistics() {
  try {
    const response = await fetch('https://tiemsachnhaem-be-mu.vercel.app/api/orders/statistics');
    if (!response.ok) throw new Error('Lỗi khi gọi API thống kê trạng thái');

    const data = await response.json();
    const orders = data.recentOrders;

    const statusCount = {
      pending: 0,
      delivered: 0,
      shipping: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      const status = order.status;
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      } else if (status === 'processing') {
        // Gộp "processing" vào "shipping"
        statusCount.shipping++;
      }
    });

    document.querySelector('.bg-yellow h3').textContent = statusCount.pending;
    document.querySelector('.bg-red h3').textContent = statusCount.delivered;
    document.querySelectorAll('.bg-gray h3')[0].textContent = statusCount.shipping;
    document.querySelectorAll('.bg-gray h3')[1].textContent = statusCount.cancelled;

  } catch (error) {
    console.error('❌ Lỗi thống kê trạng thái đơn hàng:', error);
  }
}

// ======================================
// 2. Load doanh thu và vẽ biểu đồ theo tháng
// ======================================
async function loadOrderRevenueChart() {
  try {
    const response = await fetch('https://tiemsachnhaem-be-mu.vercel.app/api/orders/statistics');
    if (!response.ok) throw new Error('Lỗi khi gọi API thống kê doanh thu');

    const data = await response.json();
    const orders = data.recentOrders;

    // Hiển thị tổng doanh thu
    const totalRevenue = parseInt(data.totalRevenue) || 0;
    const revenueDisplay = document.querySelector('span[style*="color: #86a788"]');
    if (revenueDisplay) {
      revenueDisplay.textContent = totalRevenue.toLocaleString('vi-VN') + ' ₫';
    }

    // Vẽ biểu đồ
    renderSalesChart(orders);

  } catch (error) {
    console.error('❌ Lỗi thống kê doanh thu:', error);
  }
}

function renderSalesChart(orders) {
  const currentYear = new Date().getFullYear();
  const revenueByMonth = {};

  for (let m = 1; m <= 12; m++) {
    const key = `${currentYear}-${m.toString().padStart(2, '0')}`;
    revenueByMonth[key] = 0;
  }

  orders.forEach(order => {
    if (['completed', 'delivered'].includes(order.status)) {
      const date = new Date(order.orderDate);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const key = `${year}-${month}`;

      if (year === currentYear && revenueByMonth.hasOwnProperty(key)) {
        revenueByMonth[key] += parseInt(order.totalAmount) || 0;
      }
    }
  });

  const labels = Object.keys(revenueByMonth).map((_, i) => `Tháng ${i + 1}`);
  const values = Object.values(revenueByMonth);
  const ctx = document.getElementById('salesChart').getContext('2d');

  if (window.salesChartInstance) {
    window.salesChartInstance.destroy();
  }

  window.salesChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: values,
        backgroundColor: '#86a788',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => value.toLocaleString('vi-VN') + ' ₫'
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: context => 'Doanh thu (VNĐ): ' + context.raw.toLocaleString('vi-VN')
          }
        }
      }
    }
  });
}

// Gọi các sản phẩm bán chạy
async function loadTopSellingProducts() {
  console.log("🚀 Gọi loadTopSellingProducts()");

  try {
    const response = await fetch('https://tiemsachnhaem-be-mu.vercel.app/api/products/top-selling?limit=4');
    if (!response.ok) throw new Error('Lỗi khi lấy sản phẩm bán chạy');

    const data = await response.json();

    console.log("✅ Dữ liệu thô trả về:", data);
    const products = Array.isArray(data) ? data : (data.data || []);
    console.log("📦 Danh sách sản phẩm:", products);

    const container = document.getElementById('top-products-list');
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
      container.innerHTML = '<p>Không có dữ liệu.</p>';
      return;
    }

   products.forEach(product => {
  const productHTML = `
    <div style="display: flex; align-items: flex-start; margin-bottom: 16px; gap: 12px;">
      <img src="${product.imageUrl}" alt="${product.bookTitle}" width="40" height="60" style="object-fit: cover; border-radius: 4px;" />
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
// ======================================
// 3. Gọi cả hai hàm khi trang tải
// ======================================
document.addEventListener('DOMContentLoaded', () => {
  loadOrderStatusStatistics();
  loadOrderRevenueChart();
  loadTopSellingProducts(); // 👉 gọi thêm dòng này
});

// Xuât
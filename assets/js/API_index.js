// Gọi tổng khách hàng
fetch('https://tiemsachnhaem-be-mu.vercel.app/api/users/count')
  .then(res => res.json())
  .then(data => {
    document.getElementById('total-customers').textContent = data.totalUsers || 0;
  })
  .catch(err => {
    console.error('Lỗi tổng khách hàng:', err);
    document.getElementById('total-customers').textContent = '0';
  });

// Gọi tổng đơn hàng
fetch('https://tiemsachnhaem-be-mu.vercel.app/api/orders/count')
  .then(res => res.json())
  .then(data => {
    document.getElementById('total-orders').textContent = data.totalOrders || 0;
  })
  .catch(err => {
    console.error('Lỗi tổng đơn hàng:', err);
    document.getElementById('total-orders').textContent = '0';
  });

// Gọi đơn hàng mới (pending)
fetch('https://tiemsachnhaem-be-mu.vercel.app/api/orders/count?status=pending')
  .then(res => res.json())
  .then(data => {
    document.getElementById('new-orders').textContent = data.count || 0;
  })
  .catch(err => {
    console.error('Lỗi đơn hàng mới:', err);
    document.getElementById('new-orders').textContent = '0';
  });

// Gọi doanh thu
fetch('https://tiemsachnhaem-be-mu.vercel.app/api/orders/revenue')
  .then(res => res.json())
  .then(data => {
    document.getElementById('revenue').textContent = (data.totalRevenue || 0).toLocaleString('vi-VN') + ' VND';
  })
  .catch(err => {
    console.error('Lỗi doanh thu:', err);
    document.getElementById('revenue').textContent = '0 VND';
  });

// Gọi sách bán chạy
fetch('https://tiemsachnhaem-be-mu.vercel.app/api/products/top-selling?limit=5')
  .then(res => res.json())
  .then(data => {
    if (!Array.isArray(data) || data.length === 0) {
      document.getElementById('product-list').innerHTML = 'Không có sản phẩm bán chạy.';
      return;
    }
    const html = data.map(p => `
      <div class="product-item">
        <strong>${p.name}</strong> - Đã bán: ${p.sold}
      </div>
    `).join('');
    document.getElementById('product-list').innerHTML = html;
  })
  .catch(err => {
    console.error('Lỗi sách bán chạy:', err);
    document.getElementById('product-list').innerHTML = 'Không thể tải dữ liệu.';
  });

// Tải đơn hàng gần đây
function loadRecentOrders(label, fromDate, toDate) {
  let url = `https://tiemsachnhaem-be-mu.vercel.app/api/orders/recent?limit=3`;

  if (label !== 'tùy chỉnh') {
    url += `&filter=${label}`;
  } else if (fromDate && toDate) {
    url += `&from=${fromDate}&to=${toDate}`;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        document.getElementById('recent-orders').innerHTML = 'Không có đơn hàng gần đây.';
        return;
      }
      const html = data.map(order => {
        const statusMap = {
          pending: { text: "pending", class: "red" },
          delivered: { text: "delivered", class: "green" },
          canceled: { text: "canceled", class: "gray" },
          shipped: { text: "shipped", class: "blue" },
          processing: { text: "processing", class: "orange" }
        };
        const raw = order.status?.toLowerCase();
        const status = statusMap[raw] || { text: raw || "unknown", class: "gray" };

        return `
          <div class="order-item">
            <div class="order-left">
              <img src="../assets/images/Container.png" width="32" height="32" />
              <div class="order-info">
                <strong>${order.customerId}</strong>
                <span>#${order.orderId} • ${order.productQuantity} sản phẩm</span>
              </div>
            </div>
            <div class="order-dates">
              <span>Dự kiến giao ngày:</span>${new Date(order.orderDate).toLocaleDateString('vi-VN')}
              <span>Ngày giao:</span>${order.status === 'delivered' ? new Date(order.updatedAt).toLocaleDateString('vi-VN') : "---"}
            </div>
            <div class="order-status">
              <div class="order-price">${order.totalAmount.toLocaleString()} VND</div>
              <div class="status ${status.class}">${status.text}</div>
            </div>
          </div>
        `;
      }).join('');
      document.getElementById('recent-orders').innerHTML = html;
    })
    .catch(err => {
      console.error('Lỗi đơn hàng gần đây:', err);
      document.getElementById('recent-orders').innerHTML = 'Không thể tải dữ liệu.';
    });
}

// Gắn sự kiện cho nút thời gian
document.querySelectorAll(".time-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const label = btn.innerText.trim().toLowerCase();

    if (label === "tùy chỉnh") {
      document.getElementById("custom-date-range").style.display = "block";
    } else {
      document.getElementById("custom-date-range").style.display = "none";
      loadRecentOrders(label);
    }
  });
});

// Gắn sự kiện lọc tùy chỉnh
document.getElementById("apply-filter").addEventListener("click", () => {
  const from = document.getElementById("from-date").value;
  const to = document.getElementById("to-date").value;

  if (!from || !to) {
    alert("Vui lòng chọn cả 2 ngày.");
    return;
  }
  loadRecentOrders('tùy chỉnh', from, to);
});

// Tải mặc định theo tháng khi load trang
loadRecentOrders('tháng');

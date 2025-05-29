// Hàm tiện ích để tìm phần tử chứa văn bản chính xác
HTMLElement.prototype.contains = function (text) {
  return this.textContent.trim() === text;
};

let ordersData = []; // Biến toàn cục để lưu dữ liệu từ API

// Hàm gọi API để lấy tất cả đơn hàng (GET /orders)
async function fetchOrders() {
  try {
    const response = await fetch('https://tiemsachnhaem-be-mu.vercel.app/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Thêm token nếu cần
        // 'Authorization': 'Bearer your-token-here'
      }
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi gọi API: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    ordersData = data; // Lưu dữ liệu từ API
    renderOrdersTable(); // Cập nhật bảng với dữ liệu API
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu từ API:', error);
    // Nếu API thất bại, giữ nguyên dữ liệu mẫu
    ordersData = [
      { _id: '#DH001', customerId: 'Nguyễn Văn A', email: 'nguyenvana@example.com', createdAt: '2025-05-20', totalAmount: 850000, status: 'pending' },
      { _id: '#DH002', customerId: 'Trần Thị B', email: 'tranthib@example.com', createdAt: '2025-05-18', totalAmount: 1200000, status: 'delivered' },
      { _id: '#DH003', customerId: 'Lê Văn C', email: 'levanc@example.com', createdAt: '2025-05-17', totalAmount: 720000, status: 'shipping' },
      { _id: '#DH004', customerId: 'Phạm Thị D', email: 'phamthid@example.com', createdAt: '2025-05-16', totalAmount: 450000, status: 'cancelled' }
    ];
    renderOrdersTable(); // Sử dụng dữ liệu mẫu
  }
}

// Hàm hiển thị dữ liệu lên bảng
function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  const statusText = {
    'unresolved': 'Chưa giải quyết',
    'pending': 'Đang xử lý',
    'shipping': 'Đang giao',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy'
  };

  tbody.innerHTML = ordersData.map(order => `
    <tr>
      <td>${order._id}</td>
      <td>
        <strong>${order.customerId}</strong><br>
        <small class="text-muted">${order.email || 'Chưa có email'}</small>
      </td>
      <td>${new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
      <td>${order.totalAmount.toLocaleString('vi-VN')}₫</td>
      <td><span class="badge rounded-pill status-${order.status}" id="status${order._id.slice(1)}">${statusText[order.status] || 'N/A'}</span></td>
      <td>
        <button class="btn btn-outline-primary btn-sm" onclick="showOrderDetail('${order._id}')">👁️</button>
        <button class="btn btn-outline-danger btn-sm delete-btn" onclick="deleteOrder('${order._id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// Hàm lấy chi tiết đơn hàng (GET /orders/{id})
async function showOrderDetail(orderCode) {
  try {
    // Gọi API GET /orders/{id} với id là phần số của orderCode (loại bỏ ký tự '#')
    const response = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/orders/${orderCode.slice(1)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Thêm token nếu cần
        // 'Authorization': 'Bearer your-token-here'
      }
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi gọi API: ${response.status} - ${response.statusText}`);
    }

    const order = await response.json();
    // Hiển thị dữ liệu từ API
    document.getElementById("orderCode").textContent = order._id || orderCode;
    document.getElementById("orderCustomer").textContent = order.customerId || 'Không xác định';
    document.getElementById("orderEmail").textContent = order.email || 'Chưa có email';
    document.getElementById("orderPhone").textContent = order.phone || 'Chưa có số điện thoại';
    document.getElementById("orderAddress").textContent = order.address || 'Chưa có địa chỉ';
    document.getElementById("orderDate").textContent = new Date(order.createdAt).toLocaleDateString('vi-VN');
    document.getElementById("orderTotal").textContent = order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') + '₫' : '0₫';
    document.getElementById("orderProducts").innerHTML = order.products
      .map(item => `
        <tr><td>${item.productId}</td><td>${item.quantity}</td><td>${item.price.toLocaleString('vi-VN')}₫</td></tr>
      `).join('');

    const currentStatus = order.status || 'pending';
    document.getElementById("orderStatusSelect").value = currentStatus;
    document.getElementById("orderStatus").textContent = statusText[currentStatus] || 'Đang xử lý';

    const myModal = new bootstrap.Modal(document.getElementById('orderModal'));
    myModal.show();
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    // Fallback về dữ liệu mẫu nếu API thất bại
    const fallbackOrders = {
      '#DH001': { customer: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901234567', address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM', date: '20/05/2025', total: '850,000₫' },
      '#DH002': { customer: 'Trần Thị B', email: 'tranthib@example.com', phone: '0912345678', address: '456 Lê Lợi, Quận 1, TP.HCM', date: '18/05/2025', total: '1,200,000₫' },
      '#DH003': { customer: 'Lê Văn C', email: 'levanc@example.com', phone: '0923456789', address: '789 Hai Bà Trưng, Quận 3, TP.HCM', date: '17/05/2025', total: '720,000₫' },
      '#DH004': { customer: 'Phạm Thị D', email: 'phamthid@example.com', phone: '0934567890', address: '101 Nguyễn Huệ, Quận 5, TP.HCM', date: '16/05/2025', total: '450,000₫' }
    };
    const fallbackProducts = {
      '#DH001': [{ name: 'Dust', qty: 1, price: '365,000₫' }, { name: 'Cloud Atlas: 20th Anniversary Edition', qty: 1, price: '69,000₫' }],
      '#DH002': [{ name: 'Book A', qty: 2, price: '600,000₫' }],
      '#DH003': [{ name: 'Book B', qty: 1, price: '720,000₫' }],
      '#DH004': [{ name: 'Book C', qty: 1, price: '450,000₫' }]
    };
    const order = fallbackOrders[orderCode] || ordersData.find(o => o._id === orderCode) || { customer: 'Không xác định', email: 'Chưa có email', date: 'Chưa có ngày', total: '0₫' };
    document.getElementById("orderCode").textContent = orderCode;
    document.getElementById("orderCustomer").textContent = order.customer || order.customerId || 'Không xác định';
    document.getElementById("orderEmail").textContent = order.email || 'Chưa có email';
    document.getElementById("orderPhone").textContent = order.phone || 'Chưa có số điện thoại';
    document.getElementById("orderAddress").textContent = order.address || 'Chưa có địa chỉ';
    document.getElementById("orderDate").textContent = order.date || new Date(order.createdAt || '2025-05-29').toLocaleDateString('vi-VN');
    document.getElementById("orderTotal").textContent = order.total || (order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') + '₫' : '0₫');
    document.getElementById('orderProducts').innerHTML = (fallbackProducts[orderCode] || order.products?.map(p => ({ name: p.productId, qty: p.quantity, price: p.price.toLocaleString('vi-VN') + '₫' })) || [])
      .map(item => `
        <tr><td>${item.name}</td><td>${item.qty}</td><td>${item.price}</td></tr>
      `).join('');

    const statusElement = document.getElementById(`status${orderCode.slice(1)}`);
    const currentStatus = statusElement ? statusElement.classList[2].split('-')[1] : (order.status || 'pending');
    document.getElementById("orderStatusSelect").value = currentStatus;
    document.getElementById("orderStatus").textContent = statusElement ? statusElement.textContent : statusText[currentStatus] || 'Đang xử lý';

    const myModal = new bootstrap.Modal(document.getElementById('orderModal'));
    myModal.show();

    if (error.message.includes('404')) {
      alert('Không tìm thấy đơn hàng!');
    } else if (error.message.includes('401')) {
      alert('Unauthorized! Vui lòng đăng nhập lại.');
    } else {
      alert('Không thể lấy chi tiết đơn hàng. Dữ liệu mẫu sẽ được hiển thị.');
    }
  }
}

// Hàm cập nhật trạng thái đơn hàng (PUT /orders/{id})
async function updateOrderStatus() {
  const orderCode = document.getElementById("orderCode").textContent;
  const status = document.getElementById("orderStatusSelect").value;
  const statusText = {
    'unresolved': 'Chưa giải quyết',
    'pending': 'Đang xử lý',
    'shipping': 'Đang giao',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy'
  }[status];

  try {
    // Lấy thông tin hiện tại của đơn hàng để giữ nguyên các trường khác
    const order = ordersData.find(o => o._id === orderCode);
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng trong dữ liệu hiện tại!');
    }

    // Tạo body request với thông tin cập nhật
    const updatedOrder = {
      _id: order._id,
      customerId: order.customerId,
      products: order.products || [],
      totalAmount: order.totalAmount || 0,
      status: status, // Trạng thái mới
      createdAt: order.createdAt || new Date().toISOString(),
      ISBN: order.ISBN || ''
    };

    // Gọi API PUT /orders/{id}
    const response = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/orders/${orderCode.slice(1)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Thêm token nếu cần
        // 'Authorization': 'Bearer your-token-here'
      },
      body: JSON.stringify(updatedOrder)
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi cập nhật đơn hàng: ${response.status} - ${response.statusText}`);
    }

    // Cập nhật trạng thái trên bảng chính
    const statusElement = document.getElementById(`status${orderCode.slice(1)}`);
    if (statusElement) {
      statusElement.textContent = statusText;
      statusElement.className = `badge rounded-pill status-${status}`;
    }

    // Cập nhật trạng thái trong modal
    document.getElementById("orderStatus").textContent = statusText;

    // Hiển thị popup thành công
    document.getElementById("successTitle").textContent = "Cập nhật trạng thái đơn hàng";
    document.getElementById("successMessage").textContent = `Trạng thái đơn hàng đã được cập nhật thành: ${statusText}`;
    const popup = document.getElementById("successOverlay");
    popup.style.display = "flex";

    // Đóng modal chi tiết đơn hàng
    const modalElement = document.getElementById('orderModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    // Làm mới danh sách đơn hàng
    await fetchOrders();
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    // Cập nhật giao diện ngay cả khi API thất bại
    const statusElement = document.getElementById(`status${orderCode.slice(1)}`);
    if (statusElement) {
      statusElement.textContent = statusText;
      statusElement.className = `badge rounded-pill status-${status}`;
    }
    document.getElementById("orderStatus").textContent = statusText;
    document.getElementById("successTitle").textContent = "Cập nhật trạng thái đơn hàng";
    document.getElementById("successMessage").textContent = `Trạng thái đơn hàng đã được cập nhật thành: ${statusText} (lưu ý: có lỗi khi gửi lên server)`;
    const popup = document.getElementById("successOverlay");
    popup.style.display = "flex";
    const modalElement = document.getElementById('orderModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    if (error.message.includes('404')) {
      alert('Không tìm thấy đơn hàng!');
    } else if (error.message.includes('400')) {
      alert('Dữ liệu không hợp lệ! Vui lòng kiểm tra lại.');
    } else if (error.message.includes('401')) {
      alert('Unauthorized! Vui lòng đăng nhập lại.');
    } else {
      alert('Không thể cập nhật đơn hàng. Vui lòng thử lại sau!');
    }
  }
}

// Hàm xóa đơn hàng (DELETE /orders/{id})
async function deleteOrder(orderCode) {
  if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${orderCode}?`)) {
    try {
      const response = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/orders/${orderCode.slice(1)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Thêm token nếu cần
          // 'Authorization': 'Bearer your-token-here'
        }
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi xóa đơn hàng: ${response.status} - ${response.statusText}`);
      }

      // Hiển thị popup thành công
      document.getElementById("successTitle").textContent = "Xóa đơn hàng";
      document.getElementById("successMessage").textContent = `Đơn hàng ${orderCode} đã được xóa thành công!`;
      const popup = document.getElementById("successOverlay");
      popup.style.display = "flex";

      // Làm mới danh sách đơn hàng
      await fetchOrders();
    } catch (error) {
      console.error('Lỗi khi xóa đơn hàng:', error);
      if (error.message.includes('404')) {
        alert('Không tìm thấy đơn hàng!');
      } else if (error.message.includes('401')) {
        alert('Unauthorized! Vui lòng đăng nhập lại.');
      } else if (error.message.includes('500')) {
        alert('Lỗi server! Vui lòng thử lại sau.');
      } else {
        alert('Không thể xóa đơn hàng. Vui lòng thử lại sau!');
      }
    }
  }
}

function closeSuccessPopup(event) {
  const popup = document.getElementById("successOverlay");
  if (event && !event.target.closest('.success-popup')) {
    popup.style.display = "none";
  } else if (!event) {
    popup.style.display = "none";
  }
}

// Hàm tạo đơn hàng mới (POST /orders)
window.createOrder = async function () {
  try {
    const customerId = document.getElementById('createCustomerId').value;
    const productId = document.getElementById('createProductId').value;
    const quantity = parseInt(document.getElementById('createQuantity').value);
    const price = parseInt(document.getElementById('createPrice').value);
    const totalAmount = parseInt(document.getElementById('createTotalAmount').value);
    const status = document.getElementById('createStatus').value;

    if (!customerId || !productId || !quantity || !price || !totalAmount) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const newOrder = {
      _id: `#DH${Math.floor(Math.random() * 1000 + 5).toString().padStart(3, '0')}`, // Tạo ID ngẫu nhiên
      customerId,
      products: [{ productId, quantity, price }],
      totalAmount,
      status,
      createdAt: new Date().toISOString(),
      ISBN: ''
    };

    const response = await fetch('https://tiemsachnhaem-be-mu.vercel.app/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Thêm token nếu cần
        // 'Authorization': 'Bearer your-token-here'
      },
      body: JSON.stringify(newOrder)
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi tạo đơn hàng: ${response.status} - ${response.statusText}`);
    }

    alert('Tạo đơn hàng thành công!');
    const createModal = bootstrap.Modal.getInstance(document.getElementById('createOrderModal'));
    createModal.hide();

    // Làm mới danh sách đơn hàng
    await fetchOrders();
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    if (error.message.includes('400')) {
      alert('Dữ liệu không hợp lệ! Vui lòng kiểm tra lại.');
    } else if (error.message.includes('401')) {
      alert('Unauthorized! Vui lòng đăng nhập lại.');
    } else {
      alert('Không thể tạo đơn hàng. Vui lòng thử lại sau!');
    }
  }
};

// Khởi tạo khi trang tải
document.addEventListener("DOMContentLoaded", function () {
  const popup = document.getElementById("successOverlay");
  popup.style.display = "none";
  fetchOrders(); // Gọi API khi trang tải
});

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}
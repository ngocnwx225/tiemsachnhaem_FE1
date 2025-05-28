// Hàm tiện ích để tìm phần tử chứa văn bản chính xác
HTMLElement.prototype.contains = function (text) {
  return this.textContent.trim() === text;
};

function showOrderDetail(orderCode) {
  const orders = {
    '#DH001': { customer: 'Nguyễn Văn A', email: 'nguyenvana@example.com', date: '20/05/2025', total: '850,000₫' },
    '#DH002': { customer: 'Trần Thị B', email: 'tranthib@example.com', date: '18/05/2025', total: '1,200,000₫' },
    '#DH003': { customer: 'Lê Văn C', email: 'levanc@example.com', date: '17/05/2025', total: '720,000₫' },
    '#DH004': { customer: 'Phạm Thị D', email: 'phamthid@example.com', date: '16/05/2025', total: '450,000₫' }
  };
  const products = {
    '#DH001': [{ name: 'Dust', qty: 1, price: '365,000₫' }, { name: 'Cloud Atlas: 20th Anniversary Edition', qty: 1, price: '69,000₫' }],
    '#DH002': [{ name: 'Book A', qty: 2, price: '600,000₫' }],
    '#DH003': [{ name: 'Book B', qty: 1, price: '720,000₫' }],
    '#DH004': [{ name: 'Book C', qty: 1, price: '450,000₫' }]
  };
  const order = orders[orderCode];
  document.getElementById("orderCode").textContent = orderCode;
  document.getElementById("orderCustomer").textContent = `${order.customer} (${order.email})`;
  document.getElementById("orderDate").textContent = order.date;
  document.getElementById("orderTotal").textContent = order.total;
  document.getElementById('orderProducts').innerHTML = products[orderCode].map(item => `
    <tr><td>${item.name}</td><td>${item.qty}</td><td>${item.price}</td></tr>
  `).join('');

  // Đặt trạng thái hiện tại của đơn hàng trong dropdown
  const statusElement = document.getElementById(`status${orderCode.slice(1)}`); // Sử dụng ID
  const currentStatus = statusElement.classList[2].split('-')[1];
  document.getElementById("orderStatusSelect").value = currentStatus;

  const myModal = new bootstrap.Modal(document.getElementById('orderModal'));
  myModal.show();
}

function updateOrderStatus() {
  const orderCode = document.getElementById("orderCode").textContent;
  const status = document.getElementById("orderStatusSelect").value;
  const statusText = {
    'unresolved': 'Chưa giải quyết',
    'pending': 'Đang xử lý',
    'shipping': 'Đang giao',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy'
  }[status];
  
  // Cập nhật trạng thái trên bảng chính
  const statusElement = document.getElementById(`status${orderCode.slice(1)}`); // Sử dụng ID
  if (statusElement) {
    statusElement.textContent = statusText;
    statusElement.className = `badge rounded-pill status-${status}`; // Cập nhật cả nội dung và lớp CSS
  }

  // Hiển thị popup thành công
  document.getElementById("successStatus").textContent = statusText;
  const popup = document.getElementById("successOverlay");
  popup.style.display = "flex";

  // Đóng modal chi tiết đơn hàng
  const modalElement = document.getElementById('orderModal');
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  modalInstance.hide();
}

function closeSuccessPopup(event) {
  const popup = document.getElementById("successOverlay");
  if (event && !event.target.closest('.success-popup')) {
    popup.style.display = "none";
  } else if (!event) {
    popup.style.display = "none";
  }
}

// Khởi tạo khi trang tải
document.addEventListener("DOMContentLoaded", function () {
  const popup = document.getElementById("successOverlay");
  popup.style.display = "none";
});

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}
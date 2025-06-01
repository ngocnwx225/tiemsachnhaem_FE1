// Biến toàn cục
let customers = [];
let currentRow = null;

// Gọi API để lấy danh sách khách hàng khi trang tải
async function fetchCustomers() {
  try {
    const response = await fetch('https://tiemsachnhaem-be-mu.vercel.app/api/users');
    if (!response.ok) throw new Error('Lỗi khi gọi API danh sách');
    customers = await response.json();
    renderTable();
  } catch (error) {
    console.error('Lỗi:', error);
    document.getElementById('customerList').innerHTML = '<tr><td colspan="5">Không thể tải dữ liệu khách hàng.</td></tr>';
  }
}

// Cập nhật trạng thái tài khoản qua API
async function updateUserStatus(id, status) {
  try {
    const response = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Lỗi khi cập nhật trạng thái');
    return await response.json();
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Không thể cập nhật trạng thái tài khoản.');
    return null;
  }
}

// Hiển thị dữ liệu trong bảng
function renderTable() {
  const customerList = document.getElementById('customerList');
  customerList.innerHTML = '';
  customers.forEach(customer => {
    const status = customer.status;
    const row = document.createElement('tr');
    row.setAttribute('data-id', customer.id);
    row.setAttribute('data-status', status);
    row.innerHTML = `
      <td>
        <strong>${customer.fullName}</strong><br>
        ${customer.email}<br>
        ${customer.phoneNumber || ''}
      </td>
      <td>${customer.totalOrders || 0}</td>
      <td>${(customer.totalSpent || 0).toLocaleString('vi-VN')}đ</td>
      <td><span class="status ${status ? "active" : "lock"}">${status ? 'Hoạt động' : 'Bị khóa'}</span></td>
      <td class="actions">
        <img src="https://img.icons8.com/material-outlined/24/000000/visible.png" alt="view" onclick="showPopup(this.parentNode.parentNode)">
        <img src="https://img.icons8.com/material-outlined/24/${status ? 'ff0000' : '00ff00'}/${!status ? 'unlock' : 'lock'}.png" alt="${!status ? 'unblock' : 'block'}" onclick="showConfirmPopup('${customer.fullName}', this.parentNode.parentNode, ${!status})">
      </td>
    `;
    customerList.appendChild(row);
  });
}

// Tìm kiếm
document.getElementById('searchInput').addEventListener('input', function () {
  const searchText = this.value.toLowerCase();
  const rows = document.getElementById('customerList').getElementsByTagName('tr');
  for (let row of rows) {
    const customerInfo = row.cells[0].textContent.toLowerCase();
    row.style.display = customerInfo.includes(searchText) ? '' : 'none';
  }
});

// Lọc theo trạng thái
function filterStatus(status) {
  const rows = document.getElementById('customerList').getElementsByTagName('tr');
  for (let row of rows) {
    const rowStatus = row.getAttribute('data-status');
    row.style.display = (status === 'all' || rowStatus === status) ? '' : 'none';
  }
}

// Hiển thị popup thông tin khách hàng
async function showPopup(row) {
  const customerId = row.getAttribute('data-id');
  try {
    const response = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/users/${customerId}`);
    if (!response.ok) throw new Error('Lỗi khi gọi API chi tiết');
    const customer = await response.json();

    const status = customer.status;
    document.getElementById('popupName').textContent = customer.fullName || '';
    document.getElementById('popupEmail').textContent = customer.email || '';
    document.getElementById('popupPhone').textContent = customer.phoneNumber || '';
    document.getElementById('popupAddress').textContent = customer.address || 'Chưa có địa chỉ';

    // Ngày đăng ký (dựa trên đơn hàng đầu tiên)
    const regDate = new Date(customer.createdAt).toLocaleDateString('vi-VN');
    document.getElementById('popupRegDate').textContent = regDate;

    document.getElementById('popupStatus').textContent = !status ? 'Bị khóa' : 'Hoạt động';
    document.getElementById('popupOrderCount').textContent = customer.totalOrders || 0;
    document.getElementById('popupTotalSpent').textContent = (customer.totalSpent || 0).toLocaleString('vi-VN') + 'đ';
    document.getElementById('block-btn').textContent = !status ? 'MỞ TÀI KHOẢN' : 'KHÓA TÀI KHOẢN';
    document.getElementById('block-btn').style.backgroundColor = !status ? '#00ff00' : '#ff0000';

    // Đơn hàng gần nhất và gần đây nhất
    const sortedOrders = customer.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latestOrderDate = sortedOrders.length > 0 ? new Date(sortedOrders[0].createdAt).toLocaleDateString('vi-VN') : '';
    const earliestOrderDate = sortedOrders.length > 0 ? new Date(sortedOrders[sortedOrders.length - 1].createdAt).toLocaleDateString('vi-VN') : '';
    document.getElementById('popupLastOrder').textContent = latestOrderDate;
    document.getElementById('popupEarliestOrder').textContent = earliestOrderDate;

    // Lịch sử đơn hàng
    const orderHistory = document.getElementById('popupOrderHistory');
    orderHistory.innerHTML = '';
    if (customer.orders && customer.orders.length > 0) {
      customer.orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>#${order.id}</td>
          <td>${new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
          <td>${order.totalAmount.toLocaleString('vi-VN')}đ</td>
          <td class="status-column"><span class="status ${order.status === 'completed' ? 'active' : 'lock'}">${order.status === 'completed' ? 'Đã giao' : 'Chờ xử lý'}</span></td>
        `;
        orderHistory.appendChild(row);
      });
    }

    currentRow = row;
    document.getElementById('popupOverlay').style.display = 'flex';
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Không thể tải thông tin chi tiết khách hàng.');
  }
}

// Đóng popup
function closePopup() {
  document.getElementById('popupOverlay').style.display = 'none';
}

// Hiển thị popup xác nhận khóa
function showConfirmPopup(name, row, isUnlockAction) {
  if (isUnlockAction || isAccountLocked(row)) {
    showUnlockPopup(name, row);
    return;
  }
  currentRow = row;
  document.getElementById('confirmOverlay').style.display = 'flex';
}

// Hiển thị popup xác nhận khóa từ popup thông tin
function showConfirmPopupFromPopup(name, isLocked) {
  if (isLocked) {
    showUnlockPopup(name, currentRow);
    return;
  }
  document.getElementById('confirmOverlay').style.display = 'flex';
}

// Kiểm tra trạng thái khóa
function isAccountLocked(row) {
  const statusCell = row.querySelector('.status');
  return statusCell && statusCell.textContent === "Bị khóa";
}

// Đóng popup xác nhận khóa
function closeConfirmPopup() {
  document.getElementById('confirmOverlay').style.display = 'none';
}

// Xác nhận khóa tài khoản
async function confirmBlockAction() {
  if (currentRow) {
    const customerId = currentRow.getAttribute('data-id');
    const updatedCustomer = await updateUserStatus(customerId, false);
    if (updatedCustomer) {
      const statusCell = currentRow.querySelector('.status');
      const actionCell = currentRow.querySelector('.actions img:last-child');
      statusCell.textContent = 'Bị khóa';
      statusCell.className = 'status lock';
      actionCell.src = 'https://img.icons8.com/material-outlined/24/00ff00/unlock.png';
      actionCell.alt = 'unblock';
      currentRow.setAttribute('data-status', false);
      closeConfirmPopup();
      closePopup();
      showSuccessPopup();
    }
  }
}

// Hiển thị popup thành công
function showSuccessPopup() {
  document.getElementById('successOverlay').style.display = 'flex';
  setTimeout(closeSuccessPopup, 2000);
}

// Đóng popup thành công
function closeSuccessPopup() {
  document.getElementById('successOverlay').style.display = 'none';
}

// Hiển thị popup mở khóa
function showUnlockPopup(name, row) {
  currentRow = row;
  document.getElementById('unlockOverlay').style.display = 'flex';
}

// Đóng popup mở khóa
function closeUnlockPopup() {
  document.getElementById('unlockOverlay').style.display = 'none';
}

// Xác nhận mở khóa tài khoản
async function confirmUnlockAction() {
  if (currentRow) {
    const customerId = currentRow.getAttribute('data-id');
    const updatedCustomer = await updateUserStatus(customerId, true);
    if (updatedCustomer) {
      const statusCell = currentRow.querySelector('.status');
      const actionCell = currentRow.querySelector('.actions img:last-child');
      statusCell.textContent = 'Hoạt động';
      statusCell.className = 'status active';
      actionCell.src = 'https://img.icons8.com/material-outlined/24/ff0000/lock.png';
      actionCell.alt = 'block';
      currentRow.setAttribute('data-status', true);
      closeUnlockPopup();
      if (document.getElementById('popupOverlay').style.display === 'flex') closePopup();
    }
  }
}


// Đóng popup khi nhấp ra ngoài
[popupOverlay, confirmOverlay, unlockOverlay, successOverlay].forEach(overlay => {
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) {
      [closePopup, closeConfirmPopup, closeUnlockPopup, closeSuccessPopup][['popupOverlay', 'confirmOverlay', 'unlockOverlay', 'successOverlay'].indexOf(overlay.id)]();
    }
  });
});

// Gọi API khi trang tải
document.addEventListener('DOMContentLoaded', fetchCustomers);
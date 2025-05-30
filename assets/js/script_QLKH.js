const searchInput = document.getElementById('searchInput');
const customerList = document.getElementById('customerList');
const filterOptions = document.getElementById('statusFilter');
const popupOverlay = document.getElementById('popupOverlay');
const confirmOverlay = document.getElementById('confirmOverlay');
const unlockOverlay = document.getElementById('unlockOverlay');
const successOverlay = document.getElementById('successOverlay');
let currentRow = null;
let isUnlock = false;
let customers = []; // Lưu trữ danh sách khách hàng từ API

// Gọi API để lấy danh sách khách hàng khi trang tải
async function fetchCustomers() {
  try {
    const response = await fetch('https://tiemsachnhaem-be-mu.vercel.app/api/users');
    if (!response.ok) throw new Error('Lỗi khi gọi API danh sách');
    customers = await response.json();
    renderTable();
  } catch (error) {
    console.error('Lỗi:', error);
    customerList.innerHTML = '<tr><td colspan="5">Không thể tải dữ liệu khách hàng.</td></tr>';
  }
}

// Cập nhật trạng thái tài khoản qua API
async function updateUserStatus(id, status) {
  try {
    const response = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Lỗi khi cập nhật trạng thái');
    const updatedCustomer = await response.json();
    return updatedCustomer;
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Không thể cập nhật trạng thái tài khoản.');
    return null;
  }
}

// Hiển thị dữ liệu trong bảng từ API /users
function renderTable() {
  customerList.innerHTML = '';
  customers.forEach(customer => {
    const status = customer.status.toLowerCase() === 'bị khóa' ? 'lock' : 'active';
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
      <td><span class="status ${status}">${status}</span></td>
      <td class="actions">
        <img src="https://img.icons8.com/material-outlined/24/000000/visible.png" alt="view" onclick="showPopup(this.parentNode.parentNode)">
        <img src="https://img.icons8.com/material-outlined/24/${status === 'lock' ? '00ff00' : 'ff0000'}/${status === 'lock' ? 'unlock' : 'lock'}.png" alt="${status === 'lock' ? 'unblock' : 'block'}" onclick="showConfirmPopup('${customer.fullName}', this.parentNode.parentNode, ${status === 'lock'})">
      </td>
    `;
    customerList.appendChild(row);
  });
}

// Tìm kiếm
searchInput.addEventListener('input', function () {
  const searchText = this.value.toLowerCase();
  const rows = customerList.getElementsByTagName('tr');
  for (let row of rows) {
    const customerInfo = row.cells[0].textContent.toLowerCase();
    row.style.display = customerInfo.includes(searchText) ? '' : 'none';
  }
});

// Lọc theo trạng thái
function filterStatus(status) {
  const rows = customerList.getElementsByTagName('tr');
  for (let row of rows) {
    const rowStatus = row.getAttribute('data-status');
    row.style.display = (status === 'all' || rowStatus === status) ? '' : 'none';
  }
}

// Hiển thị popup thông tin khách hàng bằng cách gọi API /users/{id}
async function showPopup(row) {
  const customerId = row.getAttribute('data-id');
  try {
    const response = await fetch(`https://tiemsachnhaem-be-mu.vercel.app/api/users/${customerId}`);
    if (!response.ok) throw new Error('Lỗi khi gọi API chi tiết');
    const customer = await response.json();

    const status = customer.status.toLowerCase() === 'bị khóa' ? 'lock' : 'active';
    document.getElementById('popupName').textContent = customer.fullName || '';
    document.getElementById('popupEmail').textContent = customer.email || '';
    document.getElementById('popupPhone').textContent = customer.phoneNumber || '';
    document.getElementById('popupAddress').textContent = customer.address || 'Chưa có địa chỉ';
    document.getElementById('popupRegDate').textContent = ''; // Không có trong API
    document.getElementById('popupStatus').textContent = status;
    document.getElementById('popupOrderCount').textContent = customer.totalOrders || 0;
    document.getElementById('popupTotalSpent').textContent = (customer.totalSpent || 0).toLocaleString('vi-VN') + 'đ';
    document.getElementById('popupLastOrder').textContent = ''; // Không có trong API
    document.getElementById('popupOrderHistory').innerHTML = ''; // Xóa dữ liệu mẫu

    currentRow = row;
    popupOverlay.style.display = 'flex';
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Không thể tải thông tin chi tiết khách hàng.');
  }
}

// Đóng popup thông tin khách hàng
function closePopup() {
  popupOverlay.style.display = 'none';
}

// Hiển thị popup xác nhận khóa từ biểu tượng ổ khóa
function showConfirmPopup(name, row, isUnlockAction = false) {
  if (isUnlockAction || isAccountLocked(row)) {
    showUnlockPopup(name, row);
    return;
  }
  currentRow = row;
  isUnlock = isUnlockAction;
  confirmOverlay.style.display = 'flex';
}

// Hiển thị popup xác nhận khóa từ popup thông tin khách hàng
function showConfirmPopupFromPopup(name, isUnlockAction = false) {
  if (isUnlockAction || isAccountLocked(currentRow)) {
    showUnlockPopup(name, currentRow);
    return;
  }
  isUnlock = isUnlockAction;
  confirmOverlay.style.display = 'flex';
}

// Kiểm tra trạng thái tài khoản có bị khóa không
function isAccountLocked(row) {
  const statusCell = row.querySelector('.status');
  const actionCell = row.querySelector('.actions img:last-child');
  return statusCell && statusCell.textContent === 'lock' && actionCell && actionCell.src.includes('unlock.png');
}

// Đóng popup xác nhận khóa
function closeConfirmPopup() {
  confirmOverlay.style.display = 'none';
}

// Xác nhận khóa tài khoản
async function confirmBlockAction() {
  if (currentRow) {
    const customerId = currentRow.getAttribute('data-id');
    const updatedCustomer = await updateUserStatus(customerId, 'lock');
    if (updatedCustomer) {
      const statusCell = currentRow.querySelector('.status');
      const actionCell = currentRow.querySelector('.actions img:last-child');

      statusCell.textContent = 'lock';
      statusCell.className = 'status lock';
      actionCell.src = 'https://img.icons8.com/material-outlined/24/00ff00/unlock.png';
      actionCell.alt = 'unblock';
      currentRow.setAttribute('data-status', 'lock');

      closeConfirmPopup();
      closePopup();
      showSuccessPopup();
    }
  }
}

// Hiển thị popup khóa thành công
function showSuccessPopup() {
  successOverlay.style.display = 'flex';
  setTimeout(closeSuccessPopup, 2000);
}

// Đóng popup khóa thành công
function closeSuccessPopup() {
  successOverlay.style.display = 'none';
}

// Hiển thị popup xác nhận mở khóa
function showUnlockPopup(name, row) {
  currentRow = row;
  unlockOverlay.style.display = 'flex';
}

// Đóng popup xác nhận mở khóa
function closeUnlockPopup() {
  unlockOverlay.style.display = 'none';
}

// Xác nhận mở khóa tài khoản
async function confirmUnlockAction() {
  if (currentRow) {
    const customerId = currentRow.getAttribute('data-id');
    const updatedCustomer = await updateUserStatus(customerId, 'active');
    if (updatedCustomer) {
      const statusCell = currentRow.querySelector('.status');
      const actionCell = currentRow.querySelector('.actions img:last-child');

      statusCell.textContent = 'active';
      statusCell.className = 'status active';
      actionCell.src = 'https://img.icons8.com/material-outlined/24/ff0000/lock.png';
      actionCell.alt = 'block';
      currentRow.setAttribute('data-status', 'active');

      closeUnlockPopup();
      if (popupOverlay.style.display === 'flex') closePopup();
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
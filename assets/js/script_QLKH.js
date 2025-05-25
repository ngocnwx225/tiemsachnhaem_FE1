const searchInput = document.getElementById('searchInput');
const customerList = document.getElementById('customerList');
const rows = customerList.getElementsByTagName('tr');
const filterOptions = document.getElementById('filterOptions');
const popupOverlay = document.getElementById('popupOverlay');
const confirmOverlay = document.getElementById('confirmOverlay');
const unlockOverlay = document.getElementById('unlockOverlay');
const successOverlay = document.getElementById('successOverlay');
let currentRow = null;
let isUnlock = false;

// Tìm kiếm
searchInput.addEventListener('input', function () {
  const searchText = this.value.toLowerCase();
  for (let row of rows) {
    const customerInfo = row.cells[0].textContent.toLowerCase();
    row.style.display = customerInfo.includes(searchText) ? '' : 'none';
  }
});

// Hiển thị/Ẩn bộ lọc
function toggleFilter() {
  filterOptions.style.display = filterOptions.style.display === 'block' ? 'none' : 'block';
}

// Lọc theo trạng thái
function filterStatus(status) {
  for (let row of rows) {
    const rowStatus = row.getAttribute('data-status');
    row.style.display = (status === 'all' || rowStatus === status) ? '' : 'none';
  }
  filterOptions.style.display = 'none';
}

// Đóng bộ lọc khi nhấp ra ngoài
document.addEventListener('click', function (event) {
  if (!event.target.closest('.filter-btn') && !event.target.closest('.filter-options')) {
    filterOptions.style.display = 'none';
  }
});

// Hiển thị popup thông tin khách hàng
function showPopup(name, email, phone, address, regDate, orderCount, totalSpent, lastOrder, row) {
  const status = row.querySelector('.status').textContent; // Lấy trạng thái từ bảng chính
  document.getElementById('popupName').textContent = name;
  document.getElementById('popupEmail').textContent = email;
  document.getElementById('popupPhone').textContent = phone;
  document.getElementById('popupAddress').textContent = address;
  document.getElementById('popupRegDate').textContent = regDate;
  document.getElementById('popupStatus').textContent = status; // Đồng bộ trạng thái từ bảng
  document.getElementById('popupOrderCount').textContent = orderCount;
  document.getElementById('popupTotalSpent').textContent = totalSpent;
  document.getElementById('popupLastOrder').textContent = lastOrder;

  const orderHistory = `
    <tr>
      <td>#12345</td>
      <td>12/07/2023</td>
      <td>850,000đ</td>
      <td><span class="status-tag delivered">Đã giao</span></td>
    </tr>
    <tr>
      <td>#12344</td>
      <td>01/06/2023</td>
      <td>720,000đ</td>
      <td><span class="status-tag delivered">Đã giao</span></td>
    </tr>
    <tr>
      <td>#12323</td>
      <td>15/05/2023</td>
      <td>1,200,000đ</td>
      <td><span class="status-tag processing">Đang xử lý</span></td>
    </tr>
  `;
  document.getElementById('popupOrderHistory').innerHTML = orderHistory;

  currentRow = row;
  popupOverlay.style.display = 'flex';
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
  return statusCell && statusCell.textContent === 'Bị khóa' && actionCell && actionCell.src.includes('unlock.png');
}

// Đóng popup xác nhận khóa
function closeConfirmPopup() {
  confirmOverlay.style.display = 'none';
}

// Xác nhận khóa tài khoản
function confirmBlockAction() {
  if (currentRow) {
    const statusCell = currentRow.querySelector('.status');
    const actionCell = currentRow.querySelector('.actions img:last-child');
    const selectedTime = document.querySelector('input[name="blockTime"]:checked').value;

    // Khóa tài khoản
    statusCell.textContent = 'Bị khóa';
    statusCell.className = 'status blocked';
    actionCell.src = 'https://img.icons8.com/material-outlined/24/00ff00/unlock.png';
    actionCell.alt = 'unblock';
    currentRow.setAttribute('data-status', 'blocked');

    // Đóng tất cả popup và hiển thị popup khóa thành công
    closeConfirmPopup();
    closePopup();
    showSuccessPopup();

    // Tự động mở khóa sau khoảng thời gian được chọn
    if (selectedTime !== 'indefinite') {
      setTimeout(() => {
        statusCell.textContent = 'Hoạt động';
        statusCell.className = 'status active';
        actionCell.src = 'https://img.icons8.com/material-outlined/24/ff0000/lock.png';
        actionCell.alt = 'block';
        currentRow.setAttribute('data-status', 'active');
      }, parseInt(selectedTime));
    }
  }
}

// Hiển thị popup khóa thành công
function showSuccessPopup() {
  successOverlay.style.display = 'flex';
  setTimeout(closeSuccessPopup, 2000); // Tự động đóng sau 2 giây
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
function confirmUnlockAction() {
  if (currentRow) {
    const statusCell = currentRow.querySelector('.status');
    const actionCell = currentRow.querySelector('.actions img:last-child');

    statusCell.textContent = 'Hoạt động';
    statusCell.className = 'status active';
    actionCell.src = 'https://img.icons8.com/material-outlined/24/ff0000/lock.png';
    actionCell.alt = 'block';
    currentRow.setAttribute('data-status', 'active');

    closeUnlockPopup();
    if (popupOverlay.style.display === 'flex') closePopup();
  }
}

// Đóng popup khi nhấp ra ngoài
popupOverlay.addEventListener('click', function (event) {
  if (event.target === popupOverlay) {
    closePopup();
  }
});

confirmOverlay.addEventListener('click', function (event) {
  if (event.target === confirmOverlay) {
    closeConfirmPopup();
  }
});

unlockOverlay.addEventListener('click', function (event) {
  if (event.target === unlockOverlay) {
    closeUnlockPopup();
  }
});

successOverlay.addEventListener('click', function (event) {
  if (event.target === successOverlay) {
    closeSuccessPopup();
  }
});
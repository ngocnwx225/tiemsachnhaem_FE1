function updateDistricts() {
    const citySelect = document.getElementById("city");
    const districtSelect = document.getElementById("district");
    const selectedCity = citySelect.value;

    // Xóa các tùy chọn quận hiện tại
    districtSelect.innerHTML = '<option value="">Quận</option>';

    // Danh sách quận theo từng tỉnh/thành phố
    const districts = {
        HaNoi: [
            "Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy", "Đống Đa", 
            "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Nam Từ Liêm", "Bắc Từ Liêm", 
            "Hà Đông"
        ],
        HoChiMinh: [
            "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", 
            "Quận 7", "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12", 
            "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình", "Tân Phú", 
            "Thủ Đức", "Bình Tân"
        ],
        Hue: [
            "Hương Thủy", "Hương Trà", "Phú Vang", "Phú Lộc", "A Lưới", 
            "Phong Điền", "Quảng Điền", "Nam Đông"
        ],
        CanTho: [
            "Ninh Kiều", "Bình Thủy", "Cái Răng", "Thốt Nốt", "Ô Môn", 
            "Phong Điền", "Cờ Đỏ", "Vĩnh Thạnh", "Thới Lai"
        ],
        DaNang: [
            "Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", 
            "Cẩm Lệ", "Hòa Vang"
        ]
    };

    // Nếu có tỉnh/thành phố được chọn, thêm các quận tương ứng
    if (selectedCity && districts[selectedCity]) {
        districts[selectedCity].forEach(district => {
            const option = document.createElement("option");
            option.value = district;
            option.text = district;
            districtSelect.appendChild(option);
        });
    }
}

// Thêm HTML cho modal thông báo
function showErrorModal(message) {
    const modalHtml = `
        <div id="errorModal" class="modal">
            <div class="modal-content error-content">
                <div class="modal-header">
                    <i class="fas fa-exclamation-circle" style="color: #ff4d4f;"></i>
                    <h2>Lỗi</h2>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-confirm" onclick="closeErrorModal()">Đóng</button>
                </div>
            </div>
        </div>
    `;
    
    // Kiểm tra nếu modal đã tồn tại thì xóa đi
    const existingModal = document.getElementById('errorModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Thêm modal mới vào body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('errorModal').style.display = 'block';
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}

function renderOrderDetails() {
    const orderDetailsContainer = document.getElementById("order-details");
    
    try {
        // Lấy dữ liệu giỏ hàng từ localStorage với xử lý lỗi
        const cartData = localStorage.getItem('cartData');
        if (!cartData) {
            throw new Error('Không tìm thấy thông tin giỏ hàng');
        }
        
        const parsedCartData = JSON.parse(cartData);
        if (!parsedCartData || !parsedCartData.items || parsedCartData.items.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

        // Tạo HTML cho chi tiết đơn hàng
        let html = '';
        parsedCartData.items.forEach(item => {
            html += `
                <div class="order-item">
                    <img src="${item.imageUrl || item.image}" alt="${item.bookTitle || item.name}">
                    <div class="info">
                        <p class="title">${item.bookTitle || item.name}</p>
                        <p class="qty">Số lượng: ${item.quantity}</p>
                    </div>
                    <p class="price">${item.price.toLocaleString('vi-VN')} đ</p>
                </div>
            `;
        });

        html += `
            <div class="summary">
                <div><span>Tổng cộng</span><span>${parsedCartData.subtotal.toLocaleString('vi-VN')} đ</span></div>
                <div><span>Vận chuyển</span><span>${parsedCartData.shipping.toLocaleString('vi-VN')} đ</span></div>
                <div><span>Giảm giá</span><span>${parsedCartData.discount.toLocaleString('vi-VN')} đ</span></div>
            </div>
            <hr>
            <div class="total">
                <span>Tổng đơn hàng</span>
                <strong>${parsedCartData.total.toLocaleString('vi-VN')} đ</strong>
            </div>
        `;

        orderDetailsContainer.innerHTML = html;
    } catch (error) {
        showErrorModal(error.message);
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 2000);
    }
}

function showConfirmationModal() {
    const nameInput = document.querySelector('#fullName');
    const phoneInput = document.querySelector('#phone');
    const emailInput = document.querySelector('#email');
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const streetInput = document.querySelector('input[placeholder="Số nhà, tên đường"]');

    // Validate form với modal thông báo
    if (!nameInput.value) {
        showErrorModal('Vui lòng nhập họ tên!');
        return;
    }

    // Validate số điện thoại
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phoneInput.value)) {
        showErrorModal('Vui lòng nhập số điện thoại hợp lệ (10 số)!');
        return;
    }

    // Validate email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(emailInput.value)) {
        showErrorModal('Vui lòng nhập email hợp lệ!');
        return;
    }

    if (!citySelect.value || !districtSelect.value || !streetInput.value) {
        showErrorModal('Vui lòng điền đầy đủ thông tin địa chỉ!');
        return;
    }

    // Cập nhật modal với dữ liệu form
    document.getElementById('modalName').textContent = nameInput.value;
    document.getElementById('modalPhone').textContent = phoneInput.value;
    document.getElementById('modalAddress').textContent = `${streetInput.value}, ${districtSelect.value}, ${citySelect.value}`;

    try {
        // Lấy dữ liệu giỏ hàng từ localStorage
        const cartData = localStorage.getItem('cartData');
        if (!cartData) {
            throw new Error('Không tìm thấy thông tin giỏ hàng');
        }

        const parsedCartData = JSON.parse(cartData);
        if (!parsedCartData || !parsedCartData.items || parsedCartData.items.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

        const modalOrderDetails = document.getElementById('modalOrderDetails');
        let totalAmount = 0;

        // Xóa nội dung cũ
        modalOrderDetails.innerHTML = '';

        // Thêm từng sản phẩm vào modal
        parsedCartData.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.marginBottom = '10px';
            itemDiv.innerHTML = `
                <span>${item.bookTitle || item.name} × ${item.quantity} quyển</span>
                <span>${(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
            `;
            modalOrderDetails.appendChild(itemDiv);
            totalAmount += item.price * item.quantity;
        });

        // Cập nhật tổng số lượng và tổng tiền
        document.getElementById('modalItemCount').textContent = parsedCartData.items.length;
        document.getElementById('modalTotalAmount').textContent = totalAmount.toLocaleString('vi-VN') + ' đ';

        // Hiển thị modal
        document.getElementById('confirmationModal').style.display = 'block';
    } catch (error) {
        showErrorModal(error.message);
    }
}

function confirmOrder() {
    try {
        // Lấy dữ liệu giỏ hàng đã thanh toán từ localStorage
        const cartData = localStorage.getItem('cartData');
        if (!cartData) {
            throw new Error('Không tìm thấy thông tin giỏ hàng');
        }

        const parsedCartData = JSON.parse(cartData);
        if (!parsedCartData || !parsedCartData.items || parsedCartData.items.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

        // Lấy danh sách giỏ hàng gốc từ localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Lấy danh sách ID của các sản phẩm đã thanh toán
        const paidItemIds = parsedCartData.items.map(item => item.id);

        // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng gốc
        cart = cart.filter(item => !paidItemIds.includes(item.id));

        // Cập nhật giỏ hàng gốc trong localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Xóa dữ liệu giỏ hàng đã thanh toán
        localStorage.removeItem('cartData');
        
        // Hiển thị thông báo thành công
        showSuccessModal('Đặt hàng thành công!');
        
        // Chuyển hướng về home.html sau 2 giây
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    } catch (error) {
        showErrorModal('Có lỗi xảy ra khi xử lý đơn hàng: ' + error.message);
    }
}

function showSuccessModal(message) {
    const modalHtml = `
        <div id="successModal" class="modal">
            <div class="modal-content success-content">
                <div class="modal-header">
                    <i class="fas fa-check-circle" style="color: #52c41a;"></i>
                    <h2>Thành công</h2>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('confirmationModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Add click event to checkout button
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', showConfirmationModal);
    }
});

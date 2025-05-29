// frontend/assets/js/javascriptPayment.js
import { orderAPI } from './API_Payment.js';

function updateDistricts() {
    const citySelect = document.getElementById("city");
    const districtSelect = document.getElementById("district");
    const selectedCity = citySelect.value;

    districtSelect.innerHTML = '<option value="">Quận/Huyện</option>';

    const districts = {
        HaNoi: ["Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy", "Đống Đa", 
            "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Nam Từ Liêm", "Bắc Từ Liêm", 
            "Hà Đông"],
        HoChiMinh: ["Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", 
            "Quận 7", "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12", 
            "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình", "Tân Phú", 
            "Thủ Đức", "Bình Tân"],
        Hue: ["Hương Thủy", "Hương Trà", "Phú Vang", "Phú Lộc", "A Lưới", 
            "Phong Điền", "Quảng Điền", "Nam Đông"],
        CanTho: ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Thốt Nốt", "Ô Môn", 
            "Phong Điền", "Cờ Đỏ", "Vĩnh Thạnh", "Thới Lai"],
        DaNang: ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", 
            "Cẩm Lệ", "Hòa Vang"]
    };

    if (selectedCity && districts[selectedCity]) {
        districts[selectedCity].forEach(district => {
            const option = document.createElement("option");
            option.value = district;
            option.text = district;
            districtSelect.appendChild(option);
        });
    }
}

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
                    <button class="btn-confirm error-close-btn">Đóng</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('errorModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('errorModal');
    modal.style.display = 'block';

    const closeButton = modal.querySelector('.error-close-btn');
    closeButton.addEventListener('click', () => {
        console.log('Closing error modal');
        closeErrorModal();
    });
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
        let cartData = localStorage.getItem('cartData');
        console.log('Cart Data Retrieved in Payment:', cartData);

        if (!cartData) {
            showErrorModal('Không tìm thấy thông tin giỏ hàng. Vui lòng quay lại giỏ hàng.');
            orderDetailsContainer.innerHTML = '<p>Không tìm thấy giỏ hàng. <a href="cart.html">Quay lại giỏ hàng</a></p>';
            return;
        }

        const parsedCartData = JSON.parse(cartData);
        console.log('Parsed Cart Data:', parsedCartData);

        if (!parsedCartData || !parsedCartData.items || parsedCartData.items.length === 0) {
            showErrorModal('Giỏ hàng trống. Vui lòng quay lại giỏ hàng để chọn sản phẩm.');
            orderDetailsContainer.innerHTML = '<p>Giỏ hàng trống. <a href="cart.html">Quay lại giỏ hàng</a></p>';
            return;
        }

        // Kiểm tra giá trị total
        if (typeof parsedCartData.total !== 'number' || parsedCartData.total <= 0) {
            console.error('Total is invalid:', parsedCartData.total);
            showErrorModal('Tổng đơn hàng không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.');
            orderDetailsContainer.innerHTML = '<p>Tổng đơn hàng không hợp lệ. <a href="cart.html">Quay lại giỏ hàng</a></p>';
            return;
        }

        let html = '';
        parsedCartData.items.forEach(item => {
            html += `
                <div class="order-item">
                    <img src="${item.image || item.imageUrl}" alt="${item.bookTitle || item.name}">
                    <div class="info">
                        <p class="title">${item.bookTitle || item.name}</p>
                        <p class="qty">Số lượng: ${item.quantity}</p>
                    </div>
                    <p class="price">${item.price.toLocaleString('vi-VN')} đ</p>
                </div>
            `;
        });

        html += `
            <hr>
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
        console.error('Error rendering order details:', error);
        showErrorModal('Có lỗi xảy ra khi hiển thị giỏ hàng: ' + error.message);
    }
}

async function showConfirmationModal() {
    const nameInput = document.querySelector('#fullName');
    const phoneInput = document.querySelector('#phone');
    const emailInput = document.querySelector('#email');
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const streetInput = document.querySelector('#street');

    if (!nameInput.value) {
        showErrorModal('Vui lòng nhập họ tên!');
        return;
    }

    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phoneInput.value)) {
        showErrorModal('Vui lòng nhập số điện thoại hợp lệ (10 số)!');
        return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0.9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(emailInput.value)) {
        showErrorModal('Vui lòng nhập email hợp lệ!');
        return;
    }

    if (!citySelect.value || !districtSelect.value || !streetInput.value) {
        showErrorModal('Vui lòng điền đầy đủ thông tin địa chỉ!');
        return;
    }

    document.getElementById('modalName').textContent = nameInput.value;
    document.getElementById('modalPhone').textContent = phoneInput.value;
    document.getElementById('modalAddress').textContent = `${streetInput.value}, ${districtSelect.value}, ${citySelect.value}`;

    try {
        const cartData = localStorage.getItem('cartData');
        if (!cartData) throw new Error('Không tìm thấy thông tin giỏ hàng');
        const parsedCartData = JSON.parse(cartData);
        if (!parsedCartData || !parsedCartData.items || parsedCartData.items.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

        // Kiểm tra giá trị total
        if (typeof parsedCartData.total !== 'number' || parsedCartData.total <= 0) {
            console.error('Total is invalid:', parsedCartData.total);
            showErrorModal('Tổng đơn hàng không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.');
            return;
        }

        const modalOrderDetails = document.getElementById('modalOrderDetails');
        modalOrderDetails.innerHTML = '';
        parsedCartData.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const itemDiv = document.createElement('div');
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.marginBottom = '10px';
            itemDiv.innerHTML = `
                <span>${item.bookTitle || item.name} × ${item.quantity} quyển</span>
                <span>${itemTotal.toLocaleString('vi-VN')} đ</span>
            `;
            modalOrderDetails.appendChild(itemDiv);
        });

        document.getElementById('modalItemCount').textContent = parsedCartData.items.length;
        document.getElementById('modalTotalAmount').textContent = parsedCartData.total.toLocaleString('vi-VN') + ' đ';

        const modal = document.getElementById('confirmationModal');
        modal.style.display = 'block';

        const cancelButton = modal.querySelector('.btn-cancel');
        const confirmButton = modal.querySelector('.btn-confirm');

        cancelButton.removeEventListener('click', closeModal);
        confirmButton.removeEventListener('click', confirmOrder);

        cancelButton.addEventListener('click', () => {
            console.log('Cancel button clicked');
            closeModal();
        });
        confirmButton.addEventListener('click', () => {
            console.log('Confirm button clicked');
            confirmOrder();
        });
    } catch (error) {
        console.error('Error in showConfirmationModal:', error);
        showErrorModal(error.message);
    }
}

async function confirmOrder() {
    try {
        console.log('Confirm Order triggered');

        const cartData = localStorage.getItem('cartData');
        if (!cartData) throw new Error('Không tìm thấy thông tin giỏ hàng');
        const parsedCartData = JSON.parse(cartData);
        if (!parsedCartData || !parsedCartData.items || parsedCartData.items.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

        // Kiểm tra giá trị total trước khi gửi lên API
        if (typeof parsedCartData.total !== 'number' || parsedCartData.total <= 0) {
            throw new Error('Tổng đơn hàng không hợp lệ');
        }

        const nameInput = document.querySelector('#fullName');
        const phoneInput = document.querySelector('#phone');
        const emailInput = document.querySelector('#email');
        const citySelect = document.getElementById('city');
        const districtSelect = document.getElementById('district');
        const streetInput = document.querySelector('#street');

        const orderData = {
            userId: 'user123',
            items: parsedCartData.items.map(item => ({
                bookId: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal: parsedCartData.subtotal,
            shipping: parsedCartData.shipping,
            discount: parsedCartData.discount,
            totalAmount: parsedCartData.total, // Đảm bảo gửi totalAmount
            orderDate: new Date().toISOString(),
            paymentMethod: 'online',
            shippingAddress: `${streetInput.value}, ${districtSelect.value}, ${citySelect.value}`,
            status: 'completed',
            currency: 'VND'
        };

        console.log('Order Data to be sent:', orderData);

        const orderResponse = await orderAPI.createOrder(orderData);
        console.log('Order Response:', orderResponse);

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const paidItemIds = parsedCartData.items.map(item => item.id);
        cart = cart.filter(item => !paidItemIds.includes(item.id));
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.removeItem('cartData');

        closeModal();
        showSuccessModal('Đặt hàng thành công!');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    } catch (error) {
        console.error('Lỗi thanh toán:', error);
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
    console.log('Closing confirmation modal');
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    const citySelect = document.getElementById('city');
    
    if (checkoutBtn) checkoutBtn.addEventListener('click', showConfirmationModal);
    if (citySelect) citySelect.addEventListener('change', updateDistricts);

    updateDistricts();
    renderOrderDetails();
});

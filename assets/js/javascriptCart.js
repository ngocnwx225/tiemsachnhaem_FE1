// --- Logic cho Giỏ hàng ---

// Dữ liệu giỏ hàng mẫu
let cartItems = [
    { id: 1, name: "Viral: The Search for the Origin of COVID-19", price: 300000, quantity: 1, image: "https://th.bing.com/th/id/OIP.41YOPVU57YEnQiDVlHvbowAAAA?rs=1&pid=ImgDetMain/60x90", checked: false },
    { id: 2, name: "The Forever Dog", price: 560000, quantity: 1, image: "https://th.bing.com/th/id/OIP.FO0fr8_PTvFtEeQlDd2BewAAAA?w=300&h=459&rs=1&pid=ImgDetMain/60x90", checked: false },
    { id: 3, name: "Think Like a Therapist", price: 400000, quantity: 1, image: "https://th.bing.com/th/id/OIP.6fAsPdK6Ob_PjYKwBcvP_wHaKc?rs=1&pid=ImgDetMain/60x90", checked: false }
];

// Biến lưu trạng thái giảm giá
let appliedDiscount = 0; // Số tiền giảm giá (ban đầu là 0)
const validDiscountCode = "DISCOUNT20"; // Mã giảm giá hợp lệ
const discountRate = 0.2; // Giảm 20%
let isDiscountApplied = false; // Trạng thái mã giảm giá đã áp dụng

// DOM elements cho giỏ hàng
const cartDOM = {
    cartItems: document.getElementById('cartItems'),
    checkoutSection: document.getElementById('checkoutSection'),
    emptyCart: document.getElementById('emptyCart'),
    itemCount: document.getElementById('itemCount'),
    subtotal: document.getElementById('subtotal'),
    shipping: document.getElementById('shipping'),
    discount: document.getElementById('discount'),
    totalPrice: document.getElementById('totalPrice'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    continueShopping: document.getElementById('continueShopping'),
    deleteModal: document.getElementById('deleteModal'),
    cancelDelete: document.getElementById('cancelDelete'),
    confirmDelete: document.getElementById('confirmDelete'),
    discountCodeInput: document.getElementById('discountCode'),
    applyDiscountBtn: document.getElementById('applyDiscountBtn'),
    discountMessageModal: document.getElementById('discountMessageModal'), // Thêm modal thông báo
    discountMessageText: document.getElementById('discountMessageText') // Thêm text trong modal
};

// Hàm định dạng tiền tệ
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Hàm hiển thị modal thông báo và tự động đóng sau 2 giây
function showDiscountMessage(message) {
    cartDOM.discountMessageText.textContent = message;
    cartDOM.discountMessageModal.style.display = 'block';
    setTimeout(() => {
        cartDOM.discountMessageModal.style.display = 'none';
    }, 2000); // Tự động đóng sau 2 giây
}

// Render giỏ hàng
function renderCart() {
    if (!cartDOM.cartItems) return; // Kiểm tra nếu không phải trang giỏ hàng
    cartDOM.cartItems.innerHTML = '';
    if (!cartItems.length) {
        cartDOM.checkoutSection.style.display = 'none';
        cartDOM.emptyCart.style.display = 'block';
        return;
    }

    cartDOM.emptyCart.style.display = 'none';
    cartDOM.checkoutSection.style.display = 'block';

    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <input type="checkbox" class="item-checkbox" data-id="${item.id}" ${item.checked ? 'checked' : ''}>
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-price">${formatPrice(item.price)}</p>
                <div class="quantity-control">
                    <button class="decrease" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <div class="item-actions">
                <p class="item-total">${formatPrice(itemTotal)}</p>
                <button class="delete-btn" data-id="${item.id}">🗑️</button>
            </div>
        `;
        cartDOM.cartItems.appendChild(cartItem);
    });

    // Cập nhật thông tin thanh toán dựa trên checkbox
    const checkedItems = cartItems.filter(item => item.checked);
    const totalItems = checkedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = checkedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 0;

    // Tính lại appliedDiscount nếu mã đã được áp dụng
    if (isDiscountApplied && subtotal !== 0) {
        appliedDiscount = subtotal * discountRate;
        showDiscountMessage(`Giảm giá đã được cập nhật: ${formatPrice(appliedDiscount)}`);
    } else {
        appliedDiscount = 0;
    }

    const total = subtotal + shipping - appliedDiscount;

    cartDOM.itemCount.textContent = totalItems;
    cartDOM.subtotal.textContent = formatPrice(subtotal);
    cartDOM.shipping.textContent = formatPrice(shipping);
    cartDOM.discount.textContent = formatPrice(appliedDiscount);
    cartDOM.totalPrice.textContent = formatPrice(total);
}

// Xử lý sự kiện cho giỏ hàng
function setupCartEvents() {
    if (!cartDOM.cartItems) return; // Kiểm tra nếu không phải trang giỏ hàng

    cartDOM.cartItems.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const item = cartItems.find(i => i.id === id);

        if (e.target.classList.contains('increase')) {
            item.quantity += 1;
        } else if (e.target.classList.contains('decrease')) {
            if (item.quantity > 1) item.quantity -= 1;
        } else if (e.target.classList.contains('delete-btn')) {
            cartDOM.deleteModal.style.display = 'block';
            cartDOM.confirmDelete.dataset.id = id;
            return;
        } else if (e.target.classList.contains('item-checkbox')) {
            item.checked = e.target.checked;
        }
        renderCart();
    });

    cartDOM.cancelDelete.addEventListener('click', () => cartDOM.deleteModal.style.display = 'none');
    cartDOM.deleteModal.addEventListener('click', (e) => e.target === cartDOM.deleteModal && (cartDOM.deleteModal.style.display = 'none'));

    cartDOM.confirmDelete.addEventListener('click', () => {
        const id = parseInt(cartDOM.confirmDelete.dataset.id);
        cartItems = cartItems.filter(item => item.id !== id);
        cartDOM.deleteModal.style.display = 'none';
        renderCart();
    });

    cartDOM.continueShopping.addEventListener('click', () => {
        window.history.back(); // Quay lại trang trước
    });

    cartDOM.checkoutBtn.addEventListener('click', () => {
        // Check if any items are selected
        const selectedItems = cartItems.filter(item => item.checked);
        if (selectedItems.length === 0) {
            showDiscountMessage('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
            return;
        }

        // Save cart data to localStorage
        const cartData = {
            items: selectedItems,
            subtotal: selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
            shipping: 0,
            discount: appliedDiscount,
            total: selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) - appliedDiscount
        };
        localStorage.setItem('cartData', JSON.stringify(cartData));
        
        // Redirect to payment page
        window.location.href = 'payment.html';
    });

    // Xử lý sự kiện áp dụng mã giảm giá
    cartDOM.applyDiscountBtn.addEventListener('click', () => {
        const code = cartDOM.discountCodeInput.value.trim();
        const subtotal = cartItems.reduce((sum, item) => sum + (item.checked ? item.price * item.quantity : 0), 0);
        if (code === validDiscountCode && !isDiscountApplied) {
            isDiscountApplied = true;
            appliedDiscount = subtotal * discountRate; // Áp dụng giảm giá 20%
            renderCart();
            showDiscountMessage('Áp dụng mã giảm giá thành công! Bạn được giảm 20%.');
        } else if (isDiscountApplied) {
            showDiscountMessage('Mã giảm giá đã được áp dụng!');
        } else {
            appliedDiscount = 0;
            isDiscountApplied = false;
            renderCart();
            showDiscountMessage('Mã giảm giá không hợp lệ!');
        }
    });
}

// Khởi tạo giỏ hàng
if (cartDOM.cartItems) {
    renderCart();
    setupCartEvents();
}
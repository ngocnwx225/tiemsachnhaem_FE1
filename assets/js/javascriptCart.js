// --- Logic cho Giỏ hàng ---

// Lấy dữ liệu giỏ hàng từ localStorage, nếu không có thì tạo mảng rỗng
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// Đảm bảo tất cả sản phẩm trong cartItems có thuộc tính checked
cartItems = cartItems.map(item => ({
    ...item,
    checked: item.checked !== undefined ? item.checked : true // Mặc định checked: true nếu không có
}));
localStorage.setItem('cart', JSON.stringify(cartItems)); // Cập nhật lại localStorage

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
    discountMessageModal: document.getElementById('discountMessageModal'),
    discountMessageText: document.getElementById('discountMessageText')
};

// Hàm định dạng tiền tệ
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Hàm hiển thị modal thông báo và tự động đóng sau 2 giây
function showDiscountMessage(message) {
    cartDOM.discountMessageText.textContent = message;
    cartDOM.discountMessageModal.style.display = 'block';
    setTimeout(() => {
        cartDOM.discountMessageModal.style.display = 'none';
    }, 2000);
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

    // Kiểm tra dữ liệu hợp lệ trước khi render
    const invalidItems = cartItems.filter(item => 
        typeof item.price !== 'number' || item.price <= 0 || 
        typeof item.quantity !== 'number' || item.quantity <= 0
    );
    if (invalidItems.length > 0) {
        console.error('Invalid cart items:', invalidItems);
        cartDOM.checkoutSection.style.display = 'none';
        cartDOM.emptyCart.style.display = 'block';
        cartDOM.emptyCart.innerHTML = '<p>Có lỗi trong dữ liệu giỏ hàng. Vui lòng xóa và thêm lại sản phẩm.</p>';
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
            <img src="${item.imageUrl || item.image}" alt="${item.bookTitle || item.name}">
            <div class="item-details">
                <h3>${item.bookTitle || item.name}</h3>
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
        const id = e.target.dataset.id;
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
        localStorage.setItem('cart', JSON.stringify(cartItems));
        renderCart();
    });

    cartDOM.cancelDelete.addEventListener('click', () => cartDOM.deleteModal.style.display = 'none');
    cartDOM.deleteModal.addEventListener('click', (e) => e.target === cartDOM.deleteModal && (cartDOM.deleteModal.style.display = 'none'));

    cartDOM.confirmDelete.addEventListener('click', () => {
        const id = cartDOM.confirmDelete.dataset.id;
        cartItems = cartItems.filter(item => item.id !== id);
        cartDOM.deleteModal.style.display = 'none';
        localStorage.setItem('cart', JSON.stringify(cartItems));
        renderCart();
    });

    cartDOM.continueShopping.addEventListener('click', () => {
        window.location.href = 'ShopPage.html';
    });

    cartDOM.checkoutBtn.addEventListener('click', () => {
        const selectedItems = cartItems.filter(item => item.checked);
        if (selectedItems.length === 0) {
            showDiscountMessage('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
            return;
        }

        // Kiểm tra dữ liệu hợp lệ trước khi lưu cartData
        const invalidItems = selectedItems.filter(item => 
            typeof item.price !== 'number' || item.price <= 0 || 
            typeof item.quantity !== 'number' || item.quantity <= 0
        );
        if (invalidItems.length > 0) {
            showDiscountMessage('Dữ liệu sản phẩm không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.');
            return;
        }

        console.log('Selected Items:', selectedItems); // Kiểm tra sản phẩm được chọn

        const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = 0;
        const discount = isDiscountApplied ? subtotal * discountRate : 0;
        const total = subtotal + shipping - discount;

        const cartData = {
            items: selectedItems.map(item => ({
                id: item.id,
                bookTitle: item.bookTitle || item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.imageUrl || item.image
            })),
            subtotal: subtotal,
            shipping: shipping,
            discount: discount,
            total: total
        };

        console.log('Cart Data to be saved:', cartData); // Kiểm tra trước khi lưu

        localStorage.setItem('cartData', JSON.stringify(cartData));
        const savedCartData = localStorage.getItem('cartData');
        console.log('Cart Data in LocalStorage:', JSON.parse(savedCartData)); // Kiểm tra sau khi lưu

        window.location.href = 'payment.html';
    });

    cartDOM.applyDiscountBtn.addEventListener('click', () => {
        const code = cartDOM.discountCodeInput.value.trim();
        const subtotal = cartItems.reduce((sum, item) => sum + (item.checked ? item.price * item.quantity : 0), 0);
        if (code === validDiscountCode && !isDiscountApplied) {
            isDiscountApplied = true;
            appliedDiscount = subtotal * discountRate;
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

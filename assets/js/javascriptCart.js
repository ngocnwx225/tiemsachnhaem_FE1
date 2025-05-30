let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// Đảm bảo tất cả sản phẩm trong cartItems có thuộc tính checked
cartItems = cartItems.map(item => ({
    ...item,
    checked: item.checked !== undefined ? item.checked : true
}));
localStorage.setItem('cart', JSON.stringify(cartItems));

// Biến lưu trạng thái giảm giá
let appliedDiscount = 0;
const validDiscountCode = "DISCOUNT20";
const discountRate = 0.2;
let isDiscountApplied = JSON.parse(localStorage.getItem('isDiscountApplied')) || false;

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
    discountMessageText: document.getElementById('discountMessageText'),
    loginPromptModal: document.getElementById('loginPromptModal'),
    cancelLoginPrompt: document.getElementById('cancelLoginPrompt'),
    confirmLoginPrompt: document.getElementById('confirmLoginPrompt')
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
    if (!cartDOM.cartItems) return;
    cartDOM.cartItems.innerHTML = '';
    if (!cartItems.length) {
        cartDOM.checkoutSection.style.display = 'none';
        cartDOM.emptyCart.style.display = 'block';
        return;
    }

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
    if (!cartDOM.cartItems) return;

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

        const invalidItems = selectedItems.filter(item => 
            typeof item.price !== 'number' || item.price <= 0 || 
            typeof item.quantity !== 'number' || item.quantity <= 0
        );
        if (invalidItems.length > 0) {
            showDiscountMessage('Dữ liệu sản phẩm không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.');
            return;
        }

        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo || !userInfo.id) {
            cartDOM.loginPromptModal.style.display = 'block';
            return;
        }

        const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = 0;
        const discount = isDiscountApplied ? subtotal * discountRate : 0;
        const total = subtotal + shipping - discount;

        if (isNaN(total) || total <= 0) {
            showDiscountMessage('Tổng đơn hàng không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.');
            return;
        }

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
            total: total,
            userId: userInfo.id
        };

        // Log để kiểm tra dữ liệu trước khi lưu
        console.log('Cart Data to be saved:', cartData);
        console.log('isDiscountApplied:', isDiscountApplied);

        // Xóa dữ liệu cũ trước khi lưu mới để tránh lỗi
        localStorage.removeItem('cartData');
        localStorage.removeItem('isDiscountApplied');

        // Lưu dữ liệu mới
        localStorage.setItem('isDiscountApplied', JSON.stringify(isDiscountApplied));
        localStorage.setItem('cartData', JSON.stringify(cartData));
        
        // Debug để kiểm tra dữ liệu sau khi lưu
        console.log('Cart Data after save - check localStorage:', {
            cartData: localStorage.getItem('cartData'),
            isDiscountApplied: localStorage.getItem('isDiscountApplied')
        });
        
        // Dùng timeout nhỏ để đảm bảo localStorage đã được lưu trước khi chuyển trang
        setTimeout(() => {
            // Nếu có hàm debug chuyển hướng, sử dụng nó
            if (window.debugRedirect && window.debugRedirect(cartData)) {
                window.location.href = 'payment.html';
            } else {
                window.location.href = 'payment.html';
            }
        }, 100);
    });

    cartDOM.applyDiscountBtn.addEventListener('click', () => {
        const code = cartDOM.discountCodeInput.value.trim();
        const subtotal = cartItems.reduce((sum, item) => sum + (item.checked ? item.price * item.quantity : 0), 0);
        if (code === validDiscountCode && !isDiscountApplied) {
            isDiscountApplied = true;
            appliedDiscount = subtotal * discountRate;
            localStorage.setItem('isDiscountApplied', JSON.stringify(isDiscountApplied));
            renderCart();
            showDiscountMessage('Áp dụng mã giảm giá thành công! Bạn được giảm 20%.');
        } else if (isDiscountApplied) {
            showDiscountMessage('Mã giảm giá đã được áp dụng!');
        } else {
            appliedDiscount = 0;
            isDiscountApplied = false;
            localStorage.setItem('isDiscountApplied', JSON.stringify(isDiscountApplied));
            renderCart();
            showDiscountMessage('Mã giảm giá không hợp lệ!');
        }
    });

    cartDOM.cancelLoginPrompt.addEventListener('click', () => {
        cartDOM.loginPromptModal.style.display = 'none';
    });

    cartDOM.confirmLoginPrompt.addEventListener('click', () => {
        cartDOM.loginPromptModal.style.display = 'none';
        window.location.href = 'dangnhap1.html';
    });

    cartDOM.loginPromptModal.addEventListener('click', (e) => {
        if (e.target === cartDOM.loginPromptModal) {
            cartDOM.loginPromptModal.style.display = 'none';
        }
    });
}

// Khởi tạo giỏ hàng
if (cartDOM.cartItems) {
    renderCart();
    setupCartEvents();
}
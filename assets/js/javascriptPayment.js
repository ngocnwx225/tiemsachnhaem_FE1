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

function renderOrderDetails() {
    const orderDetailsContainer = document.getElementById("order-details");

    // Dữ liệu sách
    const books = [
        {
            image: "https://th.bing.com/th/id/OIP.41YOPVU57YEnQiDVlHvbowAAAA?rs=1&pid=ImgDetMain",
            title: "Viral: The Search for the Origin of COVID-19",
            quantity: 1,
            price: 300000
        },
        {
            image: "https://th.bing.com/th/id/OIP.FO0fr8_PTvFtEeQlDd2BewAAAA?w=300&h=459&rs=1&pid=ImgDetMain",
            title: "The Forever Dog: A New Science Blueprint For Raising Healthy And Happy Canine Companions",
            quantity: 1,
            price: 560000
        },
        {
            image: "https://th.bing.com/th/id/OIP.6fAsPdK6Ob_PjYKwBcvP_wHaKc?rs=1&pid=ImgDetMain",
            title: "Think Like a Therapist: Six Life-Changing Insights for Leading a Good Life",
            quantity: 1,
            price: 400000
        }
    ];

    // Tính toán tổng cộng
    const subtotal = books.reduce((sum, book) => sum + book.price * book.quantity, 0);
    const shipping = 0;
    const discount = 0;
    const total = subtotal + shipping - discount;

    // Tạo HTML cho chi tiết đơn hàng
    let html = '';

    // Thêm từng mục sách
    books.forEach(book => {
        html += `
            <div class="order-item">
                <img src="${book.image}" alt="sách">
                <div class="info">
                    <p class="title">${book.title}</p>
                    <p class="qty">Số lượng: ${book.quantity}</p>
                </div>
                <p class="price">${book.price.toLocaleString('vi-VN')} đ</p>
            </div>
        `;
    });

    // Thêm phần tổng kết
    html += `
        <div class="summary">
            <div><span>Tổng cộng</span><span>${subtotal.toLocaleString('vi-VN')} đ</span></div>
            <div><span>Vận chuyển</span><span>${shipping.toLocaleString('vi-VN')} đ</span></div>
            <div><span>Giảm giá</span><span>${discount.toLocaleString('vi-VN')} đ</span></div>
        </div>
        <hr>
        <div class="total">
            <span>Tổng đơn hàng</span>
            <strong>${total.toLocaleString('vi-VN')} đ</strong>
        </div>
    `;

    // Gán HTML vào container
    orderDetailsContainer.innerHTML = html;
}

// Function to show modal
function showConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    const nameInput = document.querySelector('#fullName');
    const phoneInput = document.querySelector('#phone');
    const emailInput = document.querySelector('#email');
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const streetInput = document.querySelector('input[placeholder="Số nhà, tên đường"]');

    // Validate form
    if (!nameInput.value) {
        alert('Vui lòng nhập họ tên!');
        return;
    }

    // Validate phone number
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phoneInput.value)) {
        alert('Vui lòng nhập số điện thoại hợp lệ (10 số)!');
        return;
    }

    // Validate email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(emailInput.value)) {
        alert('Vui lòng nhập email hợp lệ!');
        return;
    }

    if (!citySelect.value || !districtSelect.value || !streetInput.value) {
        alert('Vui lòng điền đầy đủ thông tin địa chỉ!');
        return;
    }

    // Update modal with form data
    document.getElementById('modalName').textContent = nameInput.value;
    document.getElementById('modalPhone').textContent = phoneInput.value;
    document.getElementById('modalAddress').textContent = `${streetInput.value}, ${districtSelect.value}, ${citySelect.value}`;

    // Use books data directly
    const books = [
        {
            title: "Viral: The Search for the Origin of COVID-19",
            quantity: 1,
            price: 300000
        },
        {
            title: "The Forever Dog",
            quantity: 1,
            price: 560000
        },
        {
            title: "Think Like a Therapist",
            quantity: 1,
            price: 400000
        }
    ];

    const modalOrderDetails = document.getElementById('modalOrderDetails');
    let totalAmount = 0;

    // Clear previous content
    modalOrderDetails.innerHTML = '';

    // Add each item to the modal
    books.forEach(book => {
        const itemDiv = document.createElement('div');
        itemDiv.style.display = 'flex';
        itemDiv.style.justifyContent = 'space-between';
        itemDiv.style.marginBottom = '10px';
        itemDiv.innerHTML = `
            <span>${book.title} × ${book.quantity} quyển</span>
            <span>${(book.price * book.quantity).toLocaleString('vi-VN')} đ</span>
        `;
        modalOrderDetails.appendChild(itemDiv);
        totalAmount += book.price * book.quantity;
    });

    // Update total amount and item count
    document.getElementById('modalItemCount').textContent = books.length;
    document.getElementById('modalTotalAmount').textContent = totalAmount.toLocaleString('vi-VN') + ' đ';

    // Show modal
    modal.classList.add('show');
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('show');
}

// Function to confirm order
function confirmOrder() {
    // Here you would typically send the order to your backend
    alert('Đặt hàng thành công!');
    closeModal();
    // Clear cart
    localStorage.removeItem('cart');
    // Redirect to home page or order confirmation page
    window.location.href = 'index.html';
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
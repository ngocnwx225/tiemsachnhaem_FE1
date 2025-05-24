// Dữ liệu sản phẩm cục bộ
let products = [
    {
        id: 1,
        name: "Cloud Atlas: 20th Anniversary Edition",
        author: "David Carnegie",
        publisher: "NXB Tổng hợp TP.HCM",
        price: 85000,
        category: "Khoa học tự nhiên",
        imageUrl: "https://th.bing.com/th/id/OIP.H0dzOx5ktIV8zHyPxOsvhgAAAA?w=288&h=442&rs=1&pid=ImgDetMain",
        notes: ""
    },
    {
        id: 2,
        name: "Dust",
        author: "Paulo Coelho",
        publisher: "NXB Văn học",
        price: 69000,
        category: "Tiểu thuyết",
        imageUrl: "https://th.bing.com/th/id/OIP.afKgBsVqvdCXgVU7-tMmIQAAAA?rs=1&pid=ImgDetMain",
        notes: ""
    },
    {
        id: 3,
        name: "The Body - Illustrated",
        author: "Rosie Nguyễn",
        publisher: "NXB Hội Nhà Văn",
        price: 75000,
        category: "Ký sự sống",
        imageUrl: "https://th.bing.com/th/id/R.52b9ebff003869349a4572c6277870d9?rik=yQpFW44FgSPTxg&pid=ImgRaw&r=0",
        notes: ""
    },
    {
        id: 4,
        name: "The Fault In Our Stars",
        author: "Tony Buổi Sáng",
        publisher: "NXB Trẻ",
        price: 90000,
        category: "Ký sự sống",
        imageUrl: "https://th.bing.com/th/id/R.e795ce4ab4b4c1fe088529296b6ee94d?rik=JBP7Sjfuhhqp1Q&pid=ImgRaw&r=0",
        notes: ""
    },
    {
        id: 5,
        name: "The Picture Of Dorian Gray",
        author: "George S. Clason",
        publisher: "NXB Tổng hợp TP.HCM",
        price: 65000,
        category: "Kinh tế",
        imageUrl: "https://th.bing.com/th/id/OIP.FvIkMBH0Xk4-zmywIpA5fQHaK6?w=513&h=756&rs=1&pid=ImgDetMain",
        notes: ""
    }
];

// Khai báo các biến cần thiết
const addModal = document.getElementById('addModal');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const addProductBtn = document.querySelector('.add-product');
const addCancelBtn = document.getElementById('add-cancel-btn');
const addSubmitBtn = document.getElementById('add-submit-btn');
const addForm = document.getElementById('addProductForm');
const addErrorMessage = document.getElementById('addErrorMessage');
const addUploadBtn = document.getElementById('add-upload-btn');
const addImageFile = document.getElementById('add-imageFile');
const addFileName = document.getElementById('add-file-name');
const addImagePreview = document.getElementById('add-imagePreview');
const successModal = document.getElementById('successModal');
const successMessage = document.getElementById('successMessage');
const successCancelBtn = document.querySelector('.success-cancel');
const successOkBtn = document.querySelector('.success-ok');
const editCancelBtn = document.getElementById('edit-cancel-btn');
const editSubmitBtn = document.getElementById('edit-submit-btn');
const editForm = document.getElementById('editProductForm');
const editErrorMessage = document.getElementById('editErrorMessage');
const editUploadBtn = document.getElementById('edit-upload-btn');
const editImageFile = document.getElementById('edit-imageFile');
const editFileName = document.getElementById('edit-file-name');
const editImagePreview = document.getElementById('edit-imagePreview');
const deleteCancelBtn = document.querySelector('.delete-cancel');
const deleteConfirmBtn = document.querySelector('.delete-confirm');
const productTableBody = document.getElementById('productTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// Hàm render bảng sản phẩm
function renderTable(productsToRender = products) {
    productTableBody.innerHTML = '';
    productsToRender.forEach(product => {
        const row = document.createElement('tr');
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(product.price);
        row.innerHTML = `
            <td>
                <img src="${product.imageUrl}" alt="Book Cover" style="width: 40px; height: 60px;">
                <span>${product.name} <br> ID #${product.id}</span>
            </td>
            <td>${product.author}</td>
            <td>${product.publisher}</td>
            <td>${formattedPrice}</td>
            <td>${product.category}</td>
            <td>
                <button class="edit" data-id="${product.id}">✏️</button>
                <button class="delete" data-id="${product.id}">🗑️</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

// Mở modal Thêm sản phẩm
addProductBtn.addEventListener('click', () => {
    addModal.style.display = 'block';
    addErrorMessage.textContent = '';
    addFileName.textContent = 'Chưa chọn ảnh';
    addImagePreview.innerHTML = '';
    addForm.reset();
});

// Đóng modal Thêm sản phẩm
addCancelBtn.addEventListener('click', () => {
    addModal.style.display = 'none';
    addForm.reset();
    addErrorMessage.textContent = '';
    addFileName.textContent = 'Chưa chọn ảnh';
    addImagePreview.innerHTML = '';
});

addModal.addEventListener('click', (event) => {
    if (event.target === addModal) {
        addModal.style.display = 'none';
        addForm.reset();
        addErrorMessage.textContent = '';
        addFileName.textContent = 'Chưa chọn ảnh';
        addImagePreview.innerHTML = '';
    }
});

// Xử lý chọn ảnh cho Thêm sản phẩm
addUploadBtn.addEventListener('click', () => {
    addImageFile.click();
});

addImageFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            addErrorMessage.textContent = '* Vui lòng chọn file ảnh (jpg, png, gif)';
            addErrorMessage.style.color = 'red';
            addImageFile.value = '';
            addFileName.textContent = 'Chưa chọn ảnh';
            addImagePreview.innerHTML = '';
            return;
        }
        addFileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            addImagePreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.marginTop = '10px';
            addImagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        addFileName.textContent = 'Chưa chọn ảnh';
        addImagePreview.innerHTML = '';
    }
});

// Xử lý submit form Thêm sản phẩm
addForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const productName = document.getElementById('add-product-name').value.trim();
    const author = document.getElementById('add-author').value.trim();
    const publisher = document.getElementById('add-publisher').value.trim();
    const price = parseFloat(document.getElementById('add-price').value);
    const category = document.getElementById('add-category').value;
    const imageFile = addImageFile.files[0];
    const notes = document.getElementById('add-notes').value.trim();

    addErrorMessage.textContent = '';
    let hasError = false;

    if (!productName) {
        addErrorMessage.textContent += '* Tên sách là trường bắt buộc\n';
        hasError = true;
    }
    if (!author) {
        addErrorMessage.textContent += '* Tác giả là trường bắt buộc\n';
        hasError = true;
    }
    if (!publisher) {
        addErrorMessage.textContent += '* Nhà xuất bản là trường bắt buộc\n';
        hasError = true;
    }
    if (isNaN(price) || price <= 0) {
        addErrorMessage.textContent += '* Giá phải lớn hơn 0\n';
        hasError = true;
    }
    if (!category) {
        addErrorMessage.textContent += '* Thể loại là trường bắt buộc\n';
        hasError = true;
    }
    if (!imageFile) {
        addErrorMessage.textContent += '* Ảnh bìa là trường bắt buộc\n';
        hasError = true;
    }

    if (hasError) {
        addErrorMessage.style.color = 'red';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            name: productName,
            author: author,
            publisher: publisher,
            price: price,
            category: category,
            imageUrl: e.target.result,
            notes: notes
        };
        products.push(newProduct);
        renderTable();
        successMessage.textContent = 'Thêm thành công sản phẩm mới vào danh sách';
        successModal.style.display = 'block';
        addModal.style.display = 'none';
        addForm.reset();
        addFileName.textContent = 'Chưa chọn ảnh';
        addImagePreview.innerHTML = '';
    };
    reader.readAsDataURL(imageFile);
});

// Mở modal Chỉnh sửa sản phẩm
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit')) {
        const productId = parseInt(event.target.getAttribute('data-id'));
        const product = products.find(p => p.id === productId);
        if (product) {
            editModal.style.display = 'block';
            editErrorMessage.textContent = '';
            editFileName.textContent = 'Đã chọn ảnh hiện tại';
            editImagePreview.innerHTML = '';
            editForm.reset();
            editSubmitBtn.setAttribute('data-id', productId);

            document.getElementById('edit-product-name').value = product.name;
            document.getElementById('edit-author').value = product.author;
            document.getElementById('edit-publisher').value = product.publisher;
            document.getElementById('edit-price').value = product.price;
            document.getElementById('edit-category').value = product.category;
            document.getElementById('edit-notes').value = product.notes || '';
            const img = document.createElement('img');
            img.src = product.imageUrl;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.marginTop = '10px';
            editImagePreview.appendChild(img);
        }
    }
});

// Đóng modal Chỉnh sửa sản phẩm
editCancelBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    editForm.reset();
    editErrorMessage.textContent = '';
    editFileName.textContent = 'Chưa chọn ảnh';
    editImagePreview.innerHTML = '';
});

editModal.addEventListener('click', (event) => {
    if (event.target === editModal) {
        editModal.style.display = 'none';
        editForm.reset();
        editErrorMessage.textContent = '';
        editFileName.textContent = 'Chưa chọn ảnh';
        editImagePreview.innerHTML = '';
    }
});

// Xử lý chọn ảnh cho Chỉnh sửa sản phẩm
editUploadBtn.addEventListener('click', () => {
    editImageFile.click();
});

editImageFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            editErrorMessage.textContent = '* Vui lòng chọn file ảnh (jpg, png, gif)';
            editErrorMessage.style.color = 'red';
            editImageFile.value = '';
            editFileName.textContent = 'Chưa chọn ảnh';
            editImagePreview.innerHTML = '';
            return;
        }
        editFileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            editImagePreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.marginTop = '10px';
            editImagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        editFileName.textContent = 'Chưa chọn ảnh';
        editImagePreview.innerHTML = '';
    }
});

// Xử lý submit form Chỉnh sửa sản phẩm
editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const productId = parseInt(editSubmitBtn.getAttribute('data-id'));
    const productName = document.getElementById('edit-product-name').value.trim();
    const author = document.getElementById('edit-author').value.trim();
    const publisher = document.getElementById('edit-publisher').value.trim();
    const price = parseFloat(document.getElementById('edit-price').value);
    const category = document.getElementById('edit-category').value;
    const imageFile = editImageFile.files[0];
    const notes = document.getElementById('edit-notes').value.trim();

    editErrorMessage.textContent = '';
    let hasError = false;

    if (!productName) {
        editErrorMessage.textContent += '* Tên sách là trường bắt buộc\n';
        hasError = true;
    }
    if (!author) {
        editErrorMessage.textContent += '* Tác giả là trường bắt buộc\n';
        hasError = true;
    }
    if (!publisher) {
        editErrorMessage.textContent += '* Nhà xuất bản là trường bắt buộc\n';
        hasError = true;
    }
    if (isNaN(price) || price <= 0) {
        editErrorMessage.textContent += '* Giá phải lớn hơn 0\n';
        hasError = true;
    }
    if (!category) {
        editErrorMessage.textContent += '* Thể loại là trường bắt buộc\n';
        hasError = true;
    }

    if (hasError) {
        editErrorMessage.style.color = 'red';
        return;
    }

    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        const updatedProduct = {
            id: productId,
            name: productName,
            author: author,
            publisher: publisher,
            price: price,
            category: category,
            notes: notes
        };
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                updatedProduct.imageUrl = e.target.result;
                products[productIndex] = updatedProduct;
                renderTable();
                successMessage.textContent = 'Cập nhật sản phẩm thành công';
                successModal.style.display = 'block';
                editModal.style.display = 'none';
                editForm.reset();
                editFileName.textContent = 'Chưa chọn ảnh';
                editImagePreview.innerHTML = '';
            };
            reader.readAsDataURL(imageFile);
        } else {
            updatedProduct.imageUrl = products[productIndex].imageUrl;
            products[productIndex] = updatedProduct;
            renderTable();
            successMessage.textContent = 'Cập nhật sản phẩm thành công';
            successModal.style.display = 'block';
            editModal.style.display = 'none';
            editForm.reset();
            editFileName.textContent = 'Chưa chọn ảnh';
            editImagePreview.innerHTML = '';
        }
    }
});

// Mở modal Xác nhận xóa
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {
        const productId = parseInt(event.target.getAttribute('data-id'));
        deleteModal.style.display = 'block';
        deleteConfirmBtn.setAttribute('data-id', productId);
    }
});

// Đóng modal Xác nhận xóa
deleteCancelBtn.addEventListener('click', () => {
    deleteModal.style.display = 'none';
});

deleteModal.addEventListener('click', (event) => {
    if (event.target === deleteModal) {
        deleteModal.style.display = 'none';
    }
});

// Xử lý xóa sản phẩm
deleteConfirmBtn.addEventListener('click', () => {
    const productId = parseInt(deleteConfirmBtn.getAttribute('data-id'));
    products = products.filter(p => p.id !== productId);
    renderTable();
    successMessage.textContent = 'Xóa sản phẩm thành công';
    successModal.style.display = 'block';
    deleteModal.style.display = 'none';
});

// Đóng modal thành công
successOkBtn.addEventListener('click', () => {
    successModal.style.display = 'none';
    addModal.style.display = 'none';
    editModal.style.display = 'none';
    deleteModal.style.display = 'none';
    addForm.reset();
    editForm.reset();
    addFileName.textContent = 'Chưa chọn ảnh';
    addImagePreview.innerHTML = '';
    editFileName.textContent = 'Chưa chọn ảnh';
    editImagePreview.innerHTML = '';
});

successCancelBtn.addEventListener('click', () => {
    successModal.style.display = 'none';
});

// Tìm kiếm và lọc
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || product.author.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    renderTable(filteredProducts);
});

categoryFilter.addEventListener('change', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || product.author.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    renderTable(filteredProducts);
});

// Render bảng khi tải trang
renderTable();
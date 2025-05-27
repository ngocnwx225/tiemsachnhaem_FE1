// ========== KHAI BÁO BIẾN ==========
// Các elements cho bảng sản phẩm
const productTableBody = document.getElementById('productTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// Các elements cho modal thêm sản phẩm
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addProductForm');
const addErrorMessage = document.getElementById('addErrorMessage');
const addImageFile = document.getElementById('add-imageFile');
const addFileName = document.getElementById('add-file-name');
const addImagePreview = document.getElementById('add-imagePreview');

// Các elements cho modal chỉnh sửa
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editProductForm');
const editErrorMessage = document.getElementById('editErrorMessage');
const editImageFile = document.getElementById('edit-imageFile');
const editFileName = document.getElementById('edit-file-name');
const editImagePreview = document.getElementById('edit-imagePreview');

// Các nút bấm
const addProductBtn = document.querySelector('.add-product');
const addCancelBtn = document.getElementById('add-cancel-btn');
const editCancelBtn = document.getElementById('edit-cancel-btn');
const addUploadBtn = document.getElementById('add-upload-btn');
const editUploadBtn = document.getElementById('edit-upload-btn');

// Danh sách sản phẩm
let products = [];

// Thêm biến cho phân trang
let currentPage = 1;
let isLoading = false;
let hasMoreData = true;

// Thêm biến để theo dõi trạng thái loading
let loadingTimeout;

// ========== UTILITY FUNCTIONS ==========
// Hàm hiển thị loading
function showLoading() {
    if (!document.getElementById('loadingOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <div class="loading-text">
                    <p>Đang tải dữ liệu...</p>
                    <p class="small text-muted">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Thêm style cho loading
        const style = document.createElement('style');
        style.textContent = `
            #loadingOverlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            .loading-content {
                text-align: center;
            }
            .spinner {
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #86A788;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .loading-text {
                color: #333;
            }
            .loading-text .small {
                font-size: 14px;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
    }
    document.getElementById('loadingOverlay').style.display = 'flex';
}

// Hàm ẩn loading
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Hàm hiển thị thông báo lỗi
function showError(message, duration = 5000) {
    let errorMessage = document.getElementById('globalError');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.id = 'globalError';
        errorMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: #fff2f0;
            border: 1px solid #ffccc7;
            border-radius: 4px;
            color: #ff4d4f;
            font-size: 14px;
            z-index: 10000;
            display: none;
            max-width: 80%;
            word-wrap: break-word;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(errorMessage);
    }
    
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, duration);
}

// Hàm chuyển file ảnh sang base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ========== QUẢN LÝ HIỂN THỊ ==========
// Load và hiển thị sản phẩm với debounce
async function loadProducts() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading();

        productTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="py-3">
                        <div class="spinner-border text-success" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 mb-0">Đang tải danh sách sản phẩm...</p>
                    </div>
                </td>
            </tr>
        `;

        loadingTimeout = setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                const loadingText = overlay.querySelector('.loading-text');
                if (loadingText) {
                    loadingText.innerHTML = `
                        <p>Đang tải dữ liệu...</p>
                        <p class="small text-muted">Server đang xử lý, vui lòng đợi thêm</p>
                    `;
                }
            }
        }, 5000);

        products = await productAPI.getAllProducts();
        renderTable(products);

    } catch (error) {
        console.error('Error:', error);
        productTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="py-3 text-danger">
                        <p class="mb-2">${error.message}</p>
                        <button onclick="retryLoading()" class="btn btn-outline-danger btn-sm">
                            Thử lại
                        </button>
                    </div>
                </td>
            </tr>
        `;
    } finally {
        clearTimeout(loadingTimeout);
        isLoading = false;
        hideLoading();
    }
}

// Tối ưu hàm render table
function renderTable(data) {
    const fragment = document.createDocumentFragment();
    
    data.forEach(product => {
        const row = document.createElement('tr');
        const imageUrl = product.imageUrl || `../assets/images/bookcover/${product.ISBN}.png`;
        
        row.innerHTML = `
            <td style="min-width: 300px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${imageUrl}" 
                         alt="${product.bookTitle}" 
                         style="width: 45px; height: 65px; object-fit: cover;"
                         onerror="this.src='../assets/images/bookcover/default-book.png'">
                    <div style="display: flex; flex-direction: column; justify-content: center;">
                        <span>${product.bookTitle}</span>
                        <span style="color: #6c757d; font-size: 0.85em;">ISBN: ${product.ISBN}</span>
                    </div>
                </div>
            </td>
            <td class="text-truncate" style="max-width: 150px;" title="${product.author}">${product.author}</td>
            <td class="text-truncate" style="max-width: 150px;" title="${product.publisher}">${product.publisher}</td>
            <td style="width: 100px;">${product.price.toLocaleString('vi-VN')}đ</td>
            <td style="width: 200px; white-space: normal;">${product.Catalog || 'Chưa phân loại'}</td>
            <td style="width: 100px; text-align: center;">
                <div style="display: inline-flex; gap: 8px;">
                    <button class="btn btn-sm edit" data-id="${product._id}" style="padding: 4px 8px;">✏️</button>
                    <button class="btn btn-sm delete" data-id="${product._id}" style="padding: 4px 8px;">🗑️</button>
                </div>
            </td>
        `;
        fragment.appendChild(row);
    });

    productTableBody.innerHTML = '';
    productTableBody.appendChild(fragment);
}

// ========== XỬ LÝ FORM ==========
// Reset form thêm sản phẩm
function resetAddForm() {
    addForm.reset();
    addErrorMessage.textContent = '';
    addFileName.textContent = 'Chưa chọn ảnh';
    addImagePreview.innerHTML = '';
}

// Reset form chỉnh sửa
function resetEditForm() {
    editForm.reset();
    editErrorMessage.textContent = '';
    editFileName.textContent = 'Chưa chọn ảnh';
    editImagePreview.innerHTML = '';
}

// ========== XỬ LÝ SỰ KIỆN ==========
// Load dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
});

// Thêm debounce cho search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Tối ưu search
const debouncedSearch = debounce((searchTerm) => {
    const filteredProducts = products.filter(product => 
        product.bookTitle.toLowerCase().includes(searchTerm) ||
        product.author.toLowerCase().includes(searchTerm) ||
        product.ISBN.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredProducts);
}, 300);

// Xử lý tìm kiếm
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderTable(products);
        return;
    }

    const filteredProducts = products.filter(product => 
        product.bookTitle.toLowerCase().includes(searchTerm) ||
        product.author.toLowerCase().includes(searchTerm)
    );

    renderTable(filteredProducts);

    console.log('Đang tìm kiếm với từ khóa:', searchTerm);
    console.log('Số kết quả tìm thấy:', filteredProducts.length);
});

// Xử lý lọc theo thể loại
categoryFilter.addEventListener('change', () => {
    const selectedCategory = categoryFilter.value;
    const filteredProducts = selectedCategory
        ? products.filter(product => product.Catalog === selectedCategory)
        : products;
    renderTable(filteredProducts);
});

// Mở modal thêm sản phẩm
addProductBtn.addEventListener('click', () => {
    addModal.style.display = 'block';
    resetAddForm();
});

// Đóng modal thêm sản phẩm
addCancelBtn.addEventListener('click', () => {
    addModal.style.display = 'none';
    resetAddForm();
});

// Đóng modal chỉnh sửa
editCancelBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    resetEditForm();
});

// Click ngoài modal để đóng
window.addEventListener('click', (event) => {
    if (event.target === addModal) {
        addModal.style.display = 'none';
        resetAddForm();
    }
    if (event.target === editModal) {
        editModal.style.display = 'none';
        resetEditForm();
    }
});

// Xử lý chọn ảnh
[
    { uploadBtn: addUploadBtn, imageFile: addImageFile, fileName: addFileName, imagePreview: addImagePreview, errorMessage: addErrorMessage, isbnInput: 'add-isbn' },
    { uploadBtn: editUploadBtn, imageFile: editImageFile, fileName: editFileName, imagePreview: editImagePreview, errorMessage: editErrorMessage, isbnInput: 'edit-isbn' }
].forEach(({ uploadBtn, imageFile, fileName, imagePreview, errorMessage, isbnInput }) => {
    uploadBtn.addEventListener('click', () => imageFile.click());
    
    imageFile.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        const isbn = document.getElementById(isbnInput).value.trim();
        
        if (!file) {
            fileName.textContent = 'Chưa chọn ảnh';
            imagePreview.innerHTML = '';
            return;
        }

        if (!isbn) {
            errorMessage.textContent = '* Vui lòng nhập ISBN trước khi chọn ảnh bìa';
            imageFile.value = '';
            fileName.textContent = 'Chưa chọn ảnh';
            imagePreview.innerHTML = '';
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            errorMessage.textContent = '* Vui lòng chọn file ảnh (jpg, png, gif)';
            imageFile.value = '';
            fileName.textContent = 'Chưa chọn ảnh';
            imagePreview.innerHTML = '';
            return;
        }

        fileName.textContent = `${isbn}.png`;

        try {
            const base64Image = await getBase64(file);
            imagePreview.innerHTML = `<img src="${base64Image}" style="max-width: 100px; max-height: 100px; margin-top: 10px;">`;
            errorMessage.textContent = '';
        } catch (error) {
            console.error('Lỗi khi xử lý ảnh:', error);
            errorMessage.textContent = '* Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.';
            imageFile.value = '';
            fileName.textContent = 'Chưa chọn ảnh';
            imagePreview.innerHTML = '';
        }
    });
});

// ========== XỬ LÝ THÊM/SỬA/XÓA ==========
// Xử lý thêm sản phẩm
addForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    addErrorMessage.textContent = '';
    
    try {
        showLoading();
        
        const isbn = document.getElementById('add-isbn').value.trim();
        const categorySelect = document.getElementById('add-category');
        const selectedCatalog = categorySelect.value;

        if (!selectedCatalog) {
            throw new Error('Vui lòng chọn thể loại sách');
        }

        const formData = {
            ISBN: isbn,
            bookTitle: document.getElementById('add-product-name').value.trim(),
            author: document.getElementById('add-author').value.trim(),
            publisher: document.getElementById('add-publisher').value.trim(),
            price: Number(document.getElementById('add-price').value),
            Catalog: selectedCatalog,
            description: document.getElementById('add-notes').value.trim()
        };

        if (!formData.ISBN || !formData.bookTitle || !formData.author || 
            !formData.publisher || isNaN(formData.price)) {
            throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }

        const imageFile = addImageFile.files[0];
        if (imageFile) {
            formData.imageUrl = `${isbn}.png`;
        }

        console.log('Dữ liệu gửi lên:', formData);

        const response = await productAPI.createProduct(formData);

        addModal.style.display = 'none';
        resetAddForm();
        await loadProducts();
        alert('Thêm sản phẩm thành công!');

    } catch (error) {
        console.error('Lỗi:', error);
        addErrorMessage.textContent = error.message || 'Không thể thêm sản phẩm. Vui lòng kiểm tra lại thông tin và thử lại.';
        addErrorMessage.style.color = '#dc3545';
    } finally {
        hideLoading();
    }
});

// Xử lý sửa sản phẩm
productTableBody.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('edit')) return;
    
    const productId = event.target.dataset.id;
    try {
        showLoading();
        const product = await productAPI.getProductById(productId);
        
        document.getElementById('edit-isbn').value = product.ISBN || '';
        document.getElementById('edit-product-name').value = product.bookTitle || '';
        document.getElementById('edit-author').value = product.author || '';
        document.getElementById('edit-publisher').value = product.publisher || '';
        document.getElementById('edit-price').value = product.price || '';
        document.getElementById('edit-category').value = product.Catalog || '';
        document.getElementById('edit-notes').value = product.description || '';

        if (product.imageUrl) {
            editImagePreview.innerHTML = `<img src="${product.imageUrl}" style="max-width: 100px; max-height: 100px; margin-top: 10px;">`;
        } else {
            const localImageUrl = `../assets/images/bookcover/${product.ISBN}.png`;
            editImagePreview.innerHTML = `<img src="${localImageUrl}" style="max-width: 100px; max-height: 100px; margin-top: 10px;" onerror="this.style.display='none'">`;
        }

        editForm.dataset.productId = productId;
        editErrorMessage.textContent = '';
        editModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching product:', error);
        alert('Có lỗi xảy ra khi tải thông tin sản phẩm. Vui lòng thử lại.');
    } finally {
        hideLoading();
    }
});

// Xử lý submit form sửa
editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const productId = editForm.dataset.productId;
    
    const formData = {
        ISBN: document.getElementById('edit-isbn').value.trim(),
        bookTitle: document.getElementById('edit-product-name').value.trim(),
        author: document.getElementById('edit-author').value.trim(),
        publisher: document.getElementById('edit-publisher').value.trim(),
        price: parseFloat(document.getElementById('edit-price').value),
        Catalog: document.getElementById('edit-category').value,
        description: document.getElementById('edit-notes').value.trim()
    };

    console.log('Form data trước khi cập nhật:', formData);
    console.log('Product ID:', productId);
    console.log('Giá trị thể loại:', formData.Catalog);

    if (!formData.ISBN || !formData.bookTitle || !formData.author || 
        !formData.publisher || !formData.price || !formData.Catalog) {
        console.log('Validation failed:', {
            ISBN: !formData.ISBN,
            bookTitle: !formData.bookTitle,
            author: !formData.author,
            publisher: !formData.publisher,
            price: !formData.price,
            Catalog: !formData.Catalog
        });
        editErrorMessage.textContent = '* Vui lòng điền đầy đủ thông tin bắt buộc';
        return;
    }

    try {
        showLoading();
        const imageFile = editImageFile.files[0];
        if (imageFile) {
            formData.imageUrl = await getBase64(imageFile);
            console.log('Đã thêm ảnh vào form data');
        }

        const updatedProduct = {
            ISBN: formData.ISBN,
            bookTitle: formData.bookTitle,
            author: formData.author,
            publisher: formData.publisher,
            price: formData.price,
            Catalog: formData.Catalog,
            description: formData.description,
            imageUrl: formData.imageUrl || null
        };

        console.log('Dữ liệu cuối cùng gửi lên server:', updatedProduct);

        await productAPI.updateProduct(productId, updatedProduct);

        editModal.style.display = 'none';
        resetEditForm();
        await loadProducts();
        alert('Cập nhật sản phẩm thành công!');
    } catch (error) {
        console.error('Chi tiết lỗi cập nhật:', error);
        console.error('Stack trace:', error.stack);
        editErrorMessage.textContent = 'Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.';
    } finally {
        hideLoading();
    }
});

// Xử lý xóa sản phẩm
productTableBody.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('delete')) return;
    
    const productId = event.target.dataset.id;
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        try {
            showLoading();
            await productAPI.deleteProduct(productId);
            await loadProducts();
            alert('Xóa sản phẩm thành công!');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.');
        } finally {
            hideLoading();
        }
    }
});

// Hàm thử lại
function retryLoading() {
    console.log('Đang thử lại...');
    loadProducts();
}
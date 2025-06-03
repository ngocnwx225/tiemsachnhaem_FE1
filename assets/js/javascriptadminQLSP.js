// ========== KHAI BÁO BIẾN ==========
// Các elements cho bảng sản phẩm
const productTableBody = document.getElementById('productTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// Các elements cho modal thêm sản phẩm
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addProductForm');
const addErrorMessage = document.getElementById('addErrorMessage');
const addImageURL = document.getElementById('add-imageURL');
const addImagePreview = document.getElementById('add-imagePreview');

// Các elements cho modal chỉnh sửa
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editProductForm');
const editErrorMessage = document.getElementById('editErrorMessage');
const editImageURL = document.getElementById('edit-imageURL');
const editImagePreview = document.getElementById('edit-imagePreview');

// Các nút bấm
const addProductBtn = document.querySelector('.add-product');
const addCancelBtn = document.getElementById('add-cancel-btn');
const editCancelBtn = document.getElementById('edit-cancel-btn');

// Danh sách sản phẩm
let products = [];

// Biến lưu trữ danh sách thể loại
let catalogs = [];

// Giới hạn số sản phẩm hiển thị
const displayLimit = 20; // Hiển thị tối đa 20 sản phẩm (có thể đổi thành 10 nếu muốn)

// Thêm biến để theo dõi trạng thái loading
let isLoading = false;

// ========== UTILITY FUNCTIONS ==========
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

// Hàm tìm tên thể loại dựa trên ID
function getCatalogName(catalogId) {
    const catalog = catalogs.find(cat => cat._id === catalogId);
    return catalog ? (catalog.genre2nd || catalog.genreID) : 'Chưa phân loại';
}

// ========== QUẢN LÝ HIỂN THỊ ==========
// Load dữ liệu thể loại
async function loadCatalogs() {
    try {
        catalogs = await catalogAPI.getAllCatalogs();
        updateCategoryDropdowns();
    } catch (error) {
        console.error('Error loading catalogs:', error);
        showError('Không thể tải danh sách thể loại. Vui lòng thử lại.');
    }
}

// Cập nhật các dropdown thể loại
function updateCategoryDropdowns() {
    const categoryOptions = `
        <option value="">Chọn thể loại</option>
        ${catalogs.map(cat => `<option value="${cat._id}">${cat.genre2nd || cat.genreID}</option>`).join('')}
    `;
    
    document.getElementById('add-category').innerHTML = categoryOptions;
    document.getElementById('edit-category').innerHTML = categoryOptions;
    document.getElementById('categoryFilter').innerHTML = `
        <option value="">Tất cả thể loại</option>
        ${catalogs.map(cat => `<option value="${cat._id}">${cat.genre2nd || cat.genreID}</option>`).join('')}
    `;
}

// Load và hiển thị sản phẩm
async function loadProducts() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        productTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="py-3">
                        <div class="spinner-border text-success" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 mb-0">Đang tải danh sách sản phẩm...</p>
                    </div>
                </td>
            </tr>
        `;

        // Tải danh sách thể loại trước
        await loadCatalogs();

        let productsData = await productAPI.getAllProducts(1, displayLimit);
        console.log('Dữ liệu trả về từ API:', productsData);

        // Xử lý linh hoạt dữ liệu trả về từ API
        let dataToRender = [];
        if (productsData && typeof productsData === 'object') {
            if (Array.isArray(productsData)) {
                dataToRender = productsData; // Nếu là mảng trực tiếp
            } else if (productsData.data && Array.isArray(productsData.data)) {
                dataToRender = productsData.data; // Nếu là object chứa mảng trong data
            } else if (productsData.products && Array.isArray(productsData.products)) {
                dataToRender = productsData.products; // Nếu là object chứa mảng trong products
            } else {
                throw new Error('Dữ liệu trả về không chứa mảng hợp lệ');
            }
        } else {
            throw new Error('Dữ liệu trả về không phải là object hoặc mảng');
        }

        // Cập nhật danh sách sản phẩm
        products = dataToRender.slice(0, displayLimit); // Đảm bảo chỉ lấy tối đa 20 sản phẩm
        renderTable(products);

    } catch (error) {
        console.error('Error:', error);
        productTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
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
        isLoading = false;
    }
}

// Hàm render table
function renderTable(data) {
    if (!Array.isArray(data)) {
        console.error('Dữ liệu không phải là mảng:', data);
        productTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="py-3 text-danger">
                        <p class="mb-2">Dữ liệu không đúng định dạng</p>
                        <button onclick="retryLoading()" class="btn btn-outline-danger btn-sm">
                            Thử lại
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    if (data.length === 0) {
        productTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="py-3">
                        <p class="mb-0">Không có sản phẩm nào</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    
    data.forEach(product => {
        const row = document.createElement('tr');

        // Cột sản phẩm
        const productCell = document.createElement('td');
        productCell.style.minWidth = '300px';
        const productDiv = document.createElement('div');
        productDiv.style.display = 'flex';
        productDiv.style.alignItems = 'center';
        productDiv.style.gap = '12px';

        const img = document.createElement('img');
        img.src = product.imageUrl || 'https://via.placeholder.com/45x65?text=No+Image';
        img.alt = product.bookTitle;
        img.style.width = '45px';
        img.style.height = '65px';
        img.style.objectFit = 'cover';
        img.loading = 'lazy'; // Lazy loading hình ảnh
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/45x65?text=Error';
        };

        const textDiv = document.createElement('div');
        textDiv.style.display = 'flex';
        textDiv.style.flexDirection = 'column';
        textDiv.style.justifyContent = 'center';

        const titleSpan = document.createElement('span');
        titleSpan.textContent = product.bookTitle;

        const isbnSpan = document.createElement('span');
        isbnSpan.style.color = '#6c757d';
        isbnSpan.style.fontSize = '0.85em';
        isbnSpan.textContent = `ISBN: ${product.ISBN}`;

        textDiv.appendChild(titleSpan);
        textDiv.appendChild(isbnSpan);
        productDiv.appendChild(img);
        productDiv.appendChild(textDiv);
        productCell.appendChild(productDiv);

        // Cột tác giả
        const authorCell = document.createElement('td');
        authorCell.className = 'text-truncate';
        authorCell.style.maxWidth = '150px';
        authorCell.title = product.author;
        authorCell.textContent = product.author;

        // Cột nhà xuất bản
        const publisherCell = document.createElement('td');
        publisherCell.className = 'text-truncate';
        publisherCell.style.maxWidth = '150px';
        publisherCell.title = product.publisher;
        publisherCell.textContent = product.publisher;

        // Cột giá
        const priceCell = document.createElement('td');
        priceCell.style.width = '100px';
        priceCell.textContent = `${product.price.toLocaleString('vi-VN')}đ`;

        // Cột tồn kho (stock)
        const stockCell = document.createElement('td');
        stockCell.style.width = '100px';
        stockCell.textContent = product.stock !== undefined ? product.stock : 'N/A';

        // Cột thể loại
        const catalogCell = document.createElement('td');
        catalogCell.style.width = '200px';
        catalogCell.style.whiteSpace = 'normal';
        catalogCell.textContent = getCatalogName(product.catalog);

        // Cột thao tác
        const actionCell = document.createElement('td');
        actionCell.style.width = '100px';
        actionCell.style.textAlign = 'center';

        const actionDiv = document.createElement('div');
        actionDiv.style.display = 'inline-flex';
        actionDiv.style.gap = '8px';

        const editButton = document.createElement('button');
        editButton.className = 'btn btn-sm edit';
        editButton.dataset.id = product._id;
        editButton.style.padding = '4px 8px';
        editButton.textContent = '✏️';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm delete';
        deleteButton.dataset.id = product._id;
        deleteButton.style.padding = '4px 8px';
        deleteButton.textContent = '🗑️';

        actionDiv.appendChild(editButton);
        actionDiv.appendChild(deleteButton);
        actionCell.appendChild(actionDiv);

        // Thêm các cột vào hàng
        row.appendChild(productCell);
        row.appendChild(authorCell);
        row.appendChild(publisherCell);
        row.appendChild(priceCell);
        row.appendChild(stockCell);
        row.appendChild(catalogCell);
        row.appendChild(actionCell);

        fragment.appendChild(row);
    });

    productTableBody.innerHTML = ''; // Xóa bảng cũ
    productTableBody.appendChild(fragment); // Thêm toàn bộ hàng mới
}

// ========== XỬ LÝ FORM ==========
// Reset form thêm sản phẩm
function resetAddForm() {
    addForm.reset();
    addErrorMessage.textContent = '';
    addImageURL.value = '';
    addImagePreview.innerHTML = '';
}

// Reset form chỉnh sửa
function resetEditForm() {
    editForm.reset();
    editErrorMessage.textContent = '';
    editImageURL.value = '';
    editImagePreview.innerHTML = '';
}

// ========== XỬ LÝ SỰ KIỆN ==========
// Load dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
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

const debouncedSearch = debounce((searchTerm) => {
    const filteredProducts = products.filter(product => 
        product.bookTitle.toLowerCase().includes(searchTerm) ||
        product.author.toLowerCase().includes(searchTerm) ||
        product.ISBN.toString().includes(searchTerm)
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
    debouncedSearch(searchTerm);
});

// Xử lý lọc theo thể loại
categoryFilter.addEventListener('change', () => {
    const selectedCategory = categoryFilter.value;
    const filteredProducts = selectedCategory
        ? products.filter(product => product.catalog === selectedCategory)
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

// Xử lý preview ảnh khi nhập URL
[ 
    { imageURLInput: addImageURL, imagePreview: addImagePreview, errorMessage: addErrorMessage },
    { imageURLInput: editImageURL, imagePreview: editImagePreview, errorMessage: editErrorMessage }
].forEach(({ imageURLInput, imagePreview, errorMessage }) => {
    imageURLInput.addEventListener('input', (event) => {
        const url = event.target.value.trim();
        if (!url) {
            imagePreview.innerHTML = '';
            return;
        }

        if (!url.match(/^https?:\/\/.+/)) {
            errorMessage.textContent = '* URL ảnh không hợp lệ. Vui lòng nhập URL bắt đầu bằng http:// hoặc https://';
            imagePreview.innerHTML = '';
            return;
        }

        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100px';
        img.style.maxHeight = '100px';
        img.style.marginTop = '10px';
        img.loading = 'lazy';
        img.onerror = function() {
            this.style.display = 'none';
            this.parentElement.innerHTML = '<p style="color: red;">Không thể tải ảnh</p>';
        };
        imagePreview.innerHTML = '';
        imagePreview.appendChild(img);
        errorMessage.textContent = '';
    });
});

// ========== XỬ LÝ THÊM/SỬA/XÓA ==========
// Xử lý thêm sản phẩm
addForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    addErrorMessage.textContent = '';
    
    try {
        const isbn = document.getElementById('add-isbn').value.trim();
        const categorySelect = document.getElementById('add-category');
        const selectedCatalog = categorySelect.value;
        const stock = Number(document.getElementById('edit-stock').value); // Sửa ID từ add-stock thành edit-stock

        if (!selectedCatalog) {
            throw new Error('Vui lòng chọn thể loại sách');
        }

        if (isNaN(stock) || stock < 0) {
            throw new Error('Số lượng tồn kho phải là số không âm');
        }

        const formData = {
            ISBN: isbn,
            bookTitle: document.getElementById('add-product-name').value.trim(),
            author: document.getElementById('add-author').value.trim(),
            publisher: document.getElementById('add-publisher').value.trim(),
            price: Number(document.getElementById('add-price').value),
            stock: stock,
            catalog: selectedCatalog,
            description: document.getElementById('add-notes').value.trim(),
            imageUrl: addImageURL.value.trim(),
            pageCount: Number(document.getElementById('add-pageCount').value),
            bookWeight: document.getElementById('add-bookWeight').value.trim()
        };
        const checkPrice = typeof formData.price === 'number'
        const checkStock = typeof formData.stock === 'number'
        const checkPageCount = typeof formData.pageCount === 'number'
 

        if (!formData.ISBN || !formData.bookTitle || !formData.author || 
            !formData.publisher || !checkPrice || !checkStock || !checkPageCount || 
            !formData.catalog || !formData.bookWeight) {
            throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }

        if (formData.imageUrl && !formData.imageUrl.match(/^https?:\/\/.+/)) {
            throw new Error('URL ảnh không hợp lệ. Vui lòng nhập URL bắt đầu bằng http:// hoặc https://');
        }

        const response = await productAPI.createProduct(formData);

        addModal.style.display = 'none';
        resetAddForm();
        await loadProducts(); // Tải lại danh sách

        const successModal = document.getElementById('successModal');
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = 'Thêm sản phẩm mới thành công!';
        successModal.style.display = 'block';

        document.querySelector('.success-ok').onclick = () => {
            successModal.style.display = 'none';
        };
        document.querySelector('.success-cancel').onclick = () => {
            successModal.style.display = 'none';
        };

    } catch (error) {
        console.error('Lỗi:', error);
        addErrorMessage.textContent = error.message || 'Không thể thêm sản phẩm. Vui lòng kiểm tra lại thông tin và thử lại.';
        addErrorMessage.style.color = '#dc3545';
    }
});

// Xử lý sửa sản phẩm
productTableBody.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('edit')) return;
    
    const productId = event.target.dataset.id;

    try {
        // Hiển thị modal ngay lập tức với spinner
        editModal.style.display = 'block';
        editForm.style.opacity = '0.5';
        editForm.style.pointerEvents = 'none';
        editErrorMessage.innerHTML = `
            <div class="spinner-border spinner-border-sm text-success" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <span> Đang tải thông tin sản phẩm...</span>
        `;

        // Đảm bảo danh sách thể loại đã được tải
        if (!catalogs.length) {
            await loadCatalogs();
        }

        // Đo thời gian gọi API
        const startTime = performance.now();
        const product = await productAPI.getProductById(productId);
        const endTime = performance.now();
        console.log(`Thời gian gọi API getProductById(${productId}): ${(endTime - startTime).toFixed(2)}ms`);

        // Điền dữ liệu vào form
        document.getElementById('edit-isbn').value = product.ISBN || '';
        document.getElementById('edit-product-name').value = product.bookTitle || '';
        document.getElementById('edit-author').value = product.author || '';
        document.getElementById('edit-publisher').value = product.publisher || '';
        document.getElementById('edit-price').value = product.price || '';
        document.getElementById('edit-stock').value = product.stock !== undefined ? product.stock : 0;
        // Gán giá trị catalog (dùng ID)
        const editCategorySelect = document.getElementById('edit-category');
        editCategorySelect.value = product.catalog || '';
        // Nếu không tìm thấy catalog, chọn giá trị mặc định
        if (!editCategorySelect.value && editCategorySelect.options.length > 0) {
            editCategorySelect.value = '';
        }
        document.getElementById('edit-notes').value = product.description || '';
        document.getElementById('edit-pageCount').value = product.pageCount || 0;
        document.getElementById('edit-bookWeight').value = product.bookWeight || '';
        editImageURL.value = product.imageUrl || '';

        // Hiển thị hình ảnh (không chờ tải xong)
        if (product.imageUrl) {
            const img = document.createElement('img');
            img.src = product.imageUrl;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.marginTop = '10px';
            img.loading = 'lazy';
            img.onerror = function() {
                this.style.display = 'none';
                this.parentElement.innerHTML = '<p style="color: red;">Không thể tải ảnh</p>';
            };
            editImagePreview.innerHTML = '';
            editImagePreview.appendChild(img);
        } else {
            editImagePreview.innerHTML = '';
        }

        editForm.dataset.productId = productId;
        editErrorMessage.textContent = '';
        editForm.style.opacity = '1';
        editForm.style.pointerEvents = 'auto';

    } catch (error) {
        console.error('Error fetching product:', error);
        editErrorMessage.innerHTML = `
            <span style="color: red;">Có lỗi xảy ra khi tải thông tin sản phẩm. Vui lòng thử lại.</span>
            <button onclick="retryEdit('${productId}')" class="btn btn-outline-danger btn-sm mt-2">Thử lại</button>
        `;
        editForm.style.opacity = '0.5';
        editForm.style.pointerEvents = 'none';
    }
});

// Hàm thử lại khi tải thông tin sản phẩm thất bại
async function retryEdit(productId) {
    try {
        editErrorMessage.innerHTML = `
            <div class="spinner-border spinner-border-sm text-success" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <span> Đang thử lại...</span>
        `;

        // Đảm bảo danh sách thể loại đã được tải
        if (!catalogs.length) {
            await loadCatalogs();
        }

        const startTime = performance.now();
        const product = await productAPI.getProductById(productId);
        const endTime = performance.now();
        console.log(`Thời gian gọi lại API getProductById(${productId}): ${(endTime - startTime).toFixed(2)}ms`);

        document.getElementById('edit-isbn').value = product.ISBN || '';
        document.getElementById('edit-product-name').value = product.bookTitle || '';
        document.getElementById('edit-author').value = product.author || '';
        document.getElementById('edit-publisher').value = product.publisher || '';
        document.getElementById('edit-price').value = product.price || '';
        document.getElementById('edit-stock').value = product.stock !== undefined ? product.stock : 0;
        // Gán giá trị catalog (dùng ID)
        const editCategorySelect = document.getElementById('edit-category');
        editCategorySelect.value = product.catalog || '';
        // Nếu không tìm thấy catalog, chọn giá trị mặc định
        if (!editCategorySelect.value && editCategorySelect.options.length > 0) {
            editCategorySelect.value = '';
        }
        document.getElementById('edit-notes').value = product.description || '';
        document.getElementById('edit-pageCount').value = product.pageCount || 0;
        document.getElementById('edit-bookWeight').value = product.bookWeight || '';
        editImageURL.value = product.imageUrl || '';

        if (product.imageUrl) {
            const img = document.createElement('img');
            img.src = product.imageUrl;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.marginTop = '10px';
            img.loading = 'lazy';
            img.onerror = function() {
                this.style.display = 'none';
                this.parentElement.innerHTML = '<p style="color: red;">Không thể tải ảnh</p>';
            };
            editImagePreview.innerHTML = '';
            editImagePreview.appendChild(img);
        } else {
            editImagePreview.innerHTML = '';
        }

        editForm.dataset.productId = productId;
        editErrorMessage.textContent = '';
        editForm.style.opacity = '1';
        editForm.style.pointerEvents = 'auto';

    } catch (error) {
        console.error('Error retrying fetch product:', error);
        editErrorMessage.innerHTML = `
            <span style="color: red;">Có lỗi xảy ra khi tải thông tin sản phẩm. Vui lòng thử lại.</span>
            <button onclick="retryEdit('${productId}')" class="btn btn-outline-danger btn-sm mt-2">Thử lại</button>
        `;
    }
}

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
        stock: Number(document.getElementById('edit-stock').value),
        catalog: document.getElementById('edit-category').value,
        description: document.getElementById('edit-notes').value.trim(),
        imageUrl: editImageURL.value.trim(),
        pageCount: Number(document.getElementById('edit-pageCount').value),
        bookWeight: document.getElementById('edit-bookWeight').value.trim()
    };

    if (!formData.ISBN || !formData.bookTitle || !formData.author || 
        !formData.publisher || isNaN(formData.price) || isNaN(formData.stock) || 
        !formData.catalog || isNaN(formData.pageCount) || !formData.bookWeight) {
        editErrorMessage.textContent = '* Vui lòng điền đầy đủ thông tin bắt buộc';
        return;
    }

    if (formData.stock < 0) {
        editErrorMessage.textContent = '* Số lượng tồn kho phải là số không âm';
        return;
    }

    if (formData.imageUrl && !formData.imageUrl.match(/^https?:\/\/.+/)) {
        editErrorMessage.textContent = '* URL ảnh không hợp lệ. Vui lòng nhập URL bắt đầu bằng http:// hoặc https://';
        return;
    }

    try {
        await productAPI.updateProduct(productId, formData);

        editModal.style.display = 'none';
        resetEditForm();
        await loadProducts(); // Tải lại danh sách

        const successModal = document.getElementById('successModal');
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = 'Cập nhật sản phẩm thành công!';
        successModal.style.display = 'block';

        document.querySelector('.success-ok').onclick = () => {
            successModal.style.display = 'none';
        };
        document.querySelector('.success-cancel').onclick = () => {
            successModal.style.display = 'none';
        };

    } catch (error) {
        console.error('Chi tiết lỗi cập nhật:', error);
        editErrorMessage.textContent = 'Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.';
    }
});

// Xử lý xóa sản phẩm
productTableBody.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('delete')) return;
    
    const productId = event.target.dataset.id;
    const deleteModal = document.getElementById('deleteModal');

    deleteModal.style.display = 'block';

    document.querySelector('.delete-confirm').onclick = async () => {
        try {
            await productAPI.deleteProduct(productId);
            await loadProducts(); // Tải lại danh sách

            const successModal = document.getElementById('successModal');
            const successMessage = document.getElementById('successMessage');
            successMessage.textContent = 'Xóa sản phẩm thành công!';
            successModal.style.display = 'block';

            document.querySelector('.success-ok').onclick = () => {
                successModal.style.display = 'none';
            };
            document.querySelector('.success-cancel').onclick = () => {
                successModal.style.display = 'none';
            };

        } catch (error) {
            console.error('Error deleting product:', error);
            showError('Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.');
        } finally {
            deleteModal.style.display = 'none';
        }
    };

    document.querySelector('.delete-cancel').onclick = () => {
        deleteModal.style.display = 'none';
    };
});

// Hàm thử lại
function retryLoading() {
    console.log('Đang thử lại...');
    loadProducts();
}
const API_BASE_URL = 'https://tiemsachnhaem-be-mu.vercel.app/api';
const TIMEOUT_MS = 5000; // Giảm timeout xuống 20 giây
const MAX_RETRIES = 3;
const ITEMS_PER_PAGE = 5; // Giảm xuống 5 sản phẩm mỗi lần
const MAX_BACKOFF_MS = 15000; // Maximum backoff time of 30 seconds

// Hàm timeout promise
const timeout = (ms) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Request timed out after ${ms}ms`));
        }, ms);
    });
};

// Hàm retry khi gọi API thất bại
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempt ${i + 1}/${retries} for ${url}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
            
            const fetchPromise = fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(options.headers || {})
                }
            });

            try {
                const response = await fetchPromise;
                clearTimeout(timeoutId);

                // Nếu response không ok, thử đọc error message
                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage;
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.message || errorText;
                    } catch {
                        errorMessage = errorText;
                    }
                    throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
                }

                const data = await response.json();
                return data;

            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error(`Request timed out after ${TIMEOUT_MS}ms`);
                }
                throw error;
            } finally {
                clearTimeout(timeoutId);
            }

        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            lastError = error;
            
            // Nếu là lần thử cuối cùng, throw error
            if (i === retries - 1) {
                throw new Error(`All ${retries} attempts failed. Last error: ${error.message}`);
            }
            
            // Tính thời gian chờ với exponential backoff
            const waitTime = Math.min(1000 * Math.pow(2, i), MAX_BACKOFF_MS);
            console.log(`Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    throw lastError;
}

// API cho catalogs (thể loại)
const catalogAPI = {
    // Lấy danh sách thể loại
    getAllCatalogs: async () => {
        try {
            return await fetchWithRetry(`${API_BASE_URL}/catalogs`);
        } catch (error) {
            console.error('Error fetching catalogs:', error);
            throw new Error('Có lỗi xảy ra khi tải danh sách thể loại. Vui lòng thử lại sau.');
        }
    },

    // Lấy chi tiết một thể loại
    getCatalogById: async (id) => {
        try {
            return await fetchWithRetry(`${API_BASE_URL}/catalogs/${id}`);
        } catch (error) {
            console.error('Error fetching catalog:', error);
            throw new Error('Có lỗi xảy ra khi tải thông tin thể loại. Vui lòng thử lại sau.');
        }
    }
};

// API cho products
const productAPI = {
    // Lấy danh sách sản phẩm
    getAllProducts: async () => {
        try {
            console.log('Đang gọi API:', `${API_BASE_URL}/products`);
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Status:', response.status);
            console.log('Headers:', Object.fromEntries(response.headers));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Network response was not ok: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Success data:', data);
            return data;
        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            throw error;
        }
    },

    // Lấy chi tiết một sản phẩm
    getProductById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    // Thêm sản phẩm mới
    createProduct: async (productData) => {
        try {
            // Đảm bảo dữ liệu đúng format trước khi gửi
            const cleanedData = {
                ISBN: productData.ISBN.trim(),
                bookTitle: productData.bookTitle.trim(),
                author: productData.author.trim(),
                publisher: productData.publisher.trim(),
                price: Number(productData.price),
                Catalog: productData.Catalog.trim(),
                description: productData.description ? productData.description.trim() : '',
                imageUrl: productData.imageUrl || null
            };

            console.log('Cleaned data before sending:', cleanedData);

            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(cleanedData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error('Không thể thêm sản phẩm. Vui lòng kiểm tra lại thông tin.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error in createProduct:', error);
            throw error;
        }
    },

    // Cập nhật sản phẩm
    updateProduct: async (id, productData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    // Xóa sản phẩm
    deleteProduct: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }
}; 
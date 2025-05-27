const API_BASE_URL = 'https://tiemsachnhaem-be-mu.vercel.app/api';
const TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const ITEMS_PER_PAGE = 5;
const MAX_BACKOFF_MS = 15000;

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
            
            if (i === retries - 1) {
                throw new Error(`All ${retries} attempts failed. Last error: ${error.message}`);
            }
            
            const waitTime = Math.min(1000 * Math.pow(2, i), MAX_BACKOFF_MS);
            console.log(`Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    throw lastError;
}

// API cho products
const productAPI = {
    // Lấy danh sách sản phẩm
    getAllProducts: async () => {
        try {
            return await fetchWithRetry(`${API_BASE_URL}/products`);
        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            throw error;
        }
    },

    // Lấy chi tiết một sản phẩm
    getProductById: async (id) => {
        try {
            return await fetchWithRetry(`${API_BASE_URL}/products/${id}`);
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    // Thêm sản phẩm mới
    createProduct: async (productData) => {
        try {
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

            console.log('Cleaned data before updating:', cleanedData);

            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
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
                throw new Error('Không thể cập nhật sản phẩm. Vui lòng kiểm tra lại thông tin.');
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
// apiQLSP.js
const API_BASE_URL = "https://tiemsachnhaem-be-mu.vercel.app/api";

// Lấy danh sách tất cả sản phẩm
async function getAllProducts(page = 1, limit = 20) {
    try {
        const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Không thể lấy danh sách sản phẩm");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(error.message || "Lỗi khi lấy danh sách sản phẩm");
    }
}

// Lấy thông tin sản phẩm theo ID
async function getProductById(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Không thể lấy thông tin sản phẩm");
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || "Lỗi khi lấy thông tin sản phẩm");
    }
}

// Tạo sản phẩm mới
async function createProduct(productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Không thể tạo sản phẩm mới");
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || "Lỗi khi tạo sản phẩm mới");
    }
}

// Cập nhật sản phẩm theo ID
async function updateProduct(productId, productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Không thể cập nhật sản phẩm");
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || "Lỗi khi cập nhật sản phẩm");
    }
}

// Xóa sản phẩm theo ID
async function deleteProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Không thể xóa sản phẩm");
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || "Lỗi khi xóa sản phẩm");
    }
}

// Export các hàm để sử dụng trong file khác
const productAPI = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};

// Để sử dụng catalogAPI nếu cần
const catalogAPI = {
    async getAllCatalogs() {
        return [
            { _id: "Khoa học tự nhiên", genre2nd: "Khoa học tự nhiên" },
            { _id: "Kinh điển", genre2nd: "Kinh điển" },
            { _id: "Trinh thám", genre2nd: "Trinh thám" },
            { _id: "Self-help", genre2nd: "Self-help" },
            { _id: "Kinh dị", genre2nd: "Kinh dị" },
            { _id: "Tâm lý", genre2nd: "Tâm lý" },
            { _id: "Khoa học viễn tưởng", genre2nd: "Khoa học viễn tưởng" },
        ];
    },
};

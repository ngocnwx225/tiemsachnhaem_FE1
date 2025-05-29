const API_BASE_URL = 'https://tiemsachnhaem-be-mu.vercel.app/api';

const orderAPI = {
    createOrder: async (data) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create order');
        return response.json();
    },
    getOrderById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`);
        if (!response.ok) throw new Error('Order not found');
        return response.json();
    }
};

export { orderAPI };

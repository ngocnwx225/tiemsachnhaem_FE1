const API_BASE_URL = 'https://tiemsachnhaem-be-mu.vercel.app/api';

const orderAPI = {
  createOrder: async (data) => {
    const orderData = {
      userId: data.userId,
      products: data.items.map((item) => ({
        productId: item.bookId,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMethod: data.paymentMethod,
      shippingAddress: data.shippingAddress,
    };
    

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const res = await response.json();
      throw new Error(res.error);
    }
    return response.json();
  },
  getOrderById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) throw new Error('Order not found');
    return response.json();
  },
};

export { orderAPI };

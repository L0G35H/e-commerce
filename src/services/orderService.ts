import { api } from './api';

export const orderService = {
  async getOrders() {
    try {
      const res = await api.get('/orders/');
      return res.data.results || res.data;
    } catch {
      return [];
    }
  },

  async createOrder(orderData: any) {
    const res = await api.post('/orders/', orderData);
    return res.data;
  },

  async cancelOrder(orderId: string | number) {
    const res = await api.post(`/orders/${orderId}/cancel/`);
    return res.data;
  }
};

import { api } from './api';
import { PRODUCTS } from '../data/mockData';

export const productService = {
  async getProducts(params?: Record<string, any>) {
    try {
      const res = await api.get('/products/', { params });
      return res.data.results || res.data;
    } catch {
      return PRODUCTS;
    }
  },

  async getProductById(id: string) {
    try {
      const res = await api.get(`/products/${id}/`);
      return res.data;
    } catch {
      return PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
    }
  },

  async getCategories() {
    try {
      const res = await api.get('/products/categories/');
      return res.data.results || res.data;
    } catch {
      return [];
    }
  },

  async getBrands() {
    try {
      const res = await api.get('/products/brands/');
      return res.data.results || res.data;
    } catch {
      return [];
    }
  }
};

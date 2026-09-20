import { api } from './api';

export const authService = {
  async login(email: string, password: string) {
    const res = await api.post('/auth/login/', { email, password });
    if (res.data.access) {
      localStorage.setItem('intellicart_token', res.data.access);
      localStorage.setItem('intellicart_refresh_token', res.data.refresh);
    }
    return res.data;
  },

  async register(data: any) {
    const res = await api.post('/auth/register/', data);
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/users/profile/');
    return res.data;
  },

  async updateProfile(data: any) {
    const res = await api.put('/users/profile/', data);
    return res.data;
  },

  async getAddresses() {
    const res = await api.get('/users/addresses/');
    return res.data;
  },

  async addAddress(data: any) {
    const res = await api.post('/users/addresses/', data);
    return res.data;
  },

  logout() {
    localStorage.removeItem('intellicart_token');
    localStorage.removeItem('intellicart_refresh_token');
  }
};

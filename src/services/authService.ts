import { api } from './api';

export const authService = {
  async login(email: string, password: string) {
    const res = await api.post('/auth/login/', { email, password });
    if (res.data.access) {
      localStorage.setItem('intellicart_token', res.data.access);
      localStorage.setItem('intellicart_refresh_token', res.data.refresh);
      if (res.data.user) {
        localStorage.setItem('intellicart_user', JSON.stringify(res.data.user));
      }
    }
    return res.data;
  },

  async register(data: any) {
    const res = await api.post('/auth/register/', data);
    if (res.data.access) {
      localStorage.setItem('intellicart_token', res.data.access);
      localStorage.setItem('intellicart_refresh_token', res.data.refresh);
    }
    if (res.data.user) {
      localStorage.setItem('intellicart_user', JSON.stringify(res.data.user));
    }
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

  async logout() {
    const refreshToken = localStorage.getItem('intellicart_refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (err) {
        // Silently continue clearing local tokens
      }
    }
    localStorage.removeItem('intellicart_token');
    localStorage.removeItem('intellicart_refresh_token');
    localStorage.removeItem('intellicart_user');
  }
};

import { api } from './api';

export const recommendationService = {
  async getPersonalized() {
    try {
      const res = await api.get('/recommendations/personalized/');
      return res.data.recommendations || [];
    } catch {
      return [];
    }
  },

  async logInteraction(productId: string | number, interactionType: string) {
    try {
      await api.post('/recommendations/log/', { product_id: productId, interaction_type: interactionType });
    } catch (err) {
      console.warn('Failed to log interaction', err);
    }
  },

  async getRecentlyViewed() {
    try {
      const res = await api.get('/recommendations/recently-viewed/');
      return res.data.items || [];
    } catch {
      return [];
    }
  },

  async getSimilarProducts(productId: string | number) {
    try {
      const res = await api.get(`/recommendations/similar/${productId}/`);
      return res.data.products || [];
    } catch {
      return [];
    }
  }
};

import { api } from './api';

export const riskService = {
  async getRiskAssessments(riskLevel?: string) {
    try {
      const res = await api.get('/risk/', { params: { risk_level: riskLevel } });
      return res.data.results || res.data;
    } catch {
      return [];
    }
  },

  async markReviewed(id: number | string, notes?: string) {
    try {
      const res = await api.post(`/risk/${id}/mark_reviewed/`, { notes });
      return res.data;
    } catch {
      return null;
    }
  }
};

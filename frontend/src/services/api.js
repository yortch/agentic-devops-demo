import axios from 'axios';

// Use runtime config (injected at container startup) or build-time env var or fallback to localhost
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const creditCardService = {
  getAllCards: async (params = {}) => {
    const response = await api.get('/cards', { params });
    return response.data;
  },

  getCardById: async (id) => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  getCardFees: async (id) => {
    const response = await api.get(`/cards/${id}/fees`);
    return response.data;
  },

  getCardInterestRates: async (id) => {
    const response = await api.get(`/cards/${id}/interest`);
    return response.data;
  },

  getCardTransactions: async (id) => {
    const response = await api.get(`/cards/${id}/transactions`);
    return response.data;
  },

  getCardBilling: async (id) => {
    const response = await api.get(`/cards/${id}/billing`);
    return response.data;
  },
};

export default api;

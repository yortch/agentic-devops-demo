import axios from 'axios';

// Use runtime config (injected at container startup) or build-time env var or fallback to localhost
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercept responses to detect and log backend connectivity issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.error(
        `[API] Backend unreachable at ${API_BASE_URL}:`,
        error.message
      );
    } else if (error.response) {
      console.error(
        `[API] ${error.response.status} ${error.response.statusText} — ${error.config?.method?.toUpperCase()} ${error.config?.url}`
      );
    } else {
      console.error('[API] Unexpected error:', error.message);
    }
    return Promise.reject(error);
  }
);

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

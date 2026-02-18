import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleApiError = (error, fallbackMessage) => {
  const message = error.response?.data?.message
    || error.response?.data?.error
    || error.message
    || fallbackMessage;
  const apiError = new Error(message);
  apiError.status = error.response?.status;
  apiError.data = error.response?.data;
  throw apiError;
};

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

export const applicationService = {
  submitApplication: async (applicationData) => {
    try {
      const response = await api.post('/applications', applicationData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to submit credit card application.');
    }
  },

  getApplicationStatus: async (trackingId) => {
    try {
      const response = await api.get(`/applications/track/${trackingId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch application status.');
    }
  },
};

export default api;

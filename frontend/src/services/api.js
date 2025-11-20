import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cardService = {
  getAllCards: async () => {
    const response = await api.get('/cards');
    return response.data;
  },

  getCardById: async (id) => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },
};

export const applicationService = {
  submitApplication: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },
};

export default api;

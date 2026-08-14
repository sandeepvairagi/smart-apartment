import api from './api';

/** Send message to AI Chatbot */
export const sendChatMessage = (message) => api.post('/chat', { message });

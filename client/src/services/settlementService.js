import api from './api.js';

export const createSettlement = (data) => api.post('/settlements', data);
export const getSettlements = (groupId) => api.get(`/settlements/${groupId}`);
export const getSuggestedSettlements = (groupId) => api.get(`/groups/${groupId}/settlements/suggested`);

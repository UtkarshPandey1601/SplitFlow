import api from './api';

export const createGroup = (data) => api.post('/groups', data);
export const getGroups = () => api.get('/groups');
export const getGroupById = (id) => api.get(`/groups/${id}`);
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);
export const joinGroupByCode = (groupCode) => api.post('/groups/join/code', { groupCode });
export const regenerateGroupCode = (id) => api.put(`/groups/${id}/regenerate-code`);
export const getGroupBalances = (id) => api.get(`/groups/${id}/balances`);
export const getSuggestedSettlements = (id) => api.get(`/groups/${id}/settlements/suggested`);
export const getDashboardAnalytics = () => api.get('/groups/analytics');

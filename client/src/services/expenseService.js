import api from './api';

export const createExpense = (data) => {
  // Ensure splits is an object with userId keys
  return api.post('/expenses', {
    ...data,
    splits: data.splits || {}
  });
};

export const getGroupExpenses = (groupId) => api.get(`/expenses/group/${groupId}`);
export const getExpenseById = (id) => api.get(`/expenses/${id}`);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, { ...data, splits: data.splits || {} });
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

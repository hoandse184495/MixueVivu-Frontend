import api from '../api/api';
export const adminService = {
    getAllUsers: () => api.get('/admin/users'),
    getUserById: (id) => api.get(`/admin/users/${id}`),
    createUser: (data) => api.post('/admin/users', data),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    blockUser: (id) => api.put(`/admin/users/${id}/block`),
    unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),
    approveProvider: (id) => api.put(`/admin/providers/${id}/approve`),
    rejectProvider: (id, reason) => api.put(`/admin/providers/${id}/reject`, { reason }),
    getDashboard: () => api.get('/admin/dashboard'),
    getRevenueStats: () => api.get('/admin/stats/revenue'),
    getBookingStats: () => api.get('/admin/stats/bookings'),
    getTopTours: () => api.get('/admin/stats/top-tours'),
};

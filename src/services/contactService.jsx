import api from '../api/api';
export const contactService = {
    create: (subject, message) => api.post('/contacts', { subject, message }),
    getMyContacts: () => api.get('/contacts/my-contacts'),
    getAll: () => api.get('/contacts'),
    reply: (id, reply) => api.put(`/contacts/${id}/reply`, { reply, status: 'replied' }),
};

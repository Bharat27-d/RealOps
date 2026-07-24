import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth endpoints
export const auth = {
  getUser: () => api.get('/auth/user'),
  logout: () => api.get('/auth/logout'),
  emailLogin: (email, password) => api.post('/auth/login', { email, password }),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword })
};

// Events endpoints
export const events = {
  getAll: () => api.get('/api/events'),
  create: (data) => api.post('/api/events', data),
  update: (id, data) => api.put(`/api/events/${id}`, data),
  delete: (id) => api.delete(`/api/events/${id}`),
  announce: (id, channelId) => api.post(`/api/events/${id}/announce`, { channelId }),
  sendScenarios: (data) => api.post('/api/events/scenarios/send', data),
  getForumConfig: () => api.get('/api/events/forum-config'),
  updateForumConfig: (data) => api.post('/api/events/forum-config', data),
  createForum: (data) => api.post('/api/events/create-forum', data),
  getTruckerMpEvent: (eventId) => api.get(`/api/events/truckersmp/${eventId}`)
};

// Tickets endpoints
export const tickets = {
  getAll: (params) => api.get('/api/tickets', { params }),
  getById: (id) => api.get(`/api/tickets/${id}`),
  update: (id, data) => api.put(`/api/tickets/${id}`, data),
  addMessage: (id, message) => api.post(`/api/tickets/${id}/messages`, message),
  getAnalytics: () => api.get('/api/tickets/analytics/stats')
};

// Staff endpoints
export const staff = {
  getAll: (params) => api.get('/api/staff', { params }),
  getById: (id) => api.get(`/api/staff/${id}`),
  update: (id, data) => api.put(`/api/staff/${id}`, data),
  getAvailability: () => api.get('/api/staff/availability/calendar'),
  requestAvailability: (data) => api.post('/api/staff/availability/request', data),
  createOpening: (data) => api.post('/api/staff/openings/create', data),
  getOpenings: () => api.get('/api/staff/openings/list'),
  updateOpening: (id, data) => api.put(`/api/staff/openings/${id}`, data),
  deleteOpening: (id) => api.delete(`/api/staff/openings/${id}`),
  announceOpenings: (channelId, openings) => api.post('/api/staff/openings/announce', { channelId, openings }),
  updateRoles: (id, roleId, action) => api.post(`/api/staff/${id}/roles`, { roleId, action })
};

// Embeds endpoints
export const embeds = {
  getAll: () => api.get('/api/embeds'),
  save: (data) => api.post('/api/embeds/save', data),
  update: (id, data) => api.put(`/api/embeds/${id}`, data),
  delete: (id) => api.delete(`/api/embeds/${id}`),
  send: (channelId, embedData) => api.post('/api/embeds/send', { channelId, embedData }),
  duplicate: (id) => api.post(`/api/embeds/${id}/duplicate`),
  fetchMessage: (channelId, messageId) => api.get('/api/embeds/fetch-message', { params: { channelId, messageId } }),
  editMessage: (channelId, messageId, embedData, content) => api.put('/api/embeds/edit-message', { channelId, messageId, embedData, content }),
  sendMultiple: (channelIds, embedsData, mentions) => api.post('/api/embeds/send-multiple', { channelIds, embedsData, mentions })
};

// Panels endpoints
export const panels = {
  getAll: () => api.get('/api/panels'),
  getByType: (type) => api.get(`/api/panels/${type}`),
  save: (data) => api.post('/api/panels', data),
  deploy: (id, channelId, customPanelId) => api.post(`/api/panels/${id}/deploy`, { channelId, customPanelId }),
  delete: (id) => api.delete(`/api/panels/${id}`),
  createCustom: (data) => api.post('/api/panels/custom', data),
  updateCustom: (id, data) => api.put(`/api/panels/custom/${id}`, data),
  deleteCustom: (id) => api.delete(`/api/panels/custom/${id}`),
  updatePanelState: (panelId, enabled) => api.put(`/api/panels/${panelId}/state`, { enabled }),
  toggleButton: (buttonId, enabled) => api.post('/api/panels/toggle-button', { buttonId, enabled })
};

// Discord endpoints
export const discord = {
  getChannels: () => api.get('/api/discord/channels'),
  getRoles: () => api.get('/api/discord/roles'),
  getUsers: () => api.get('/api/discord/users'),
  getMembers: (roleIds) => api.get('/api/discord/members', { params: { roleIds: roleIds?.join(',') } }),
  sendDM: (userId, content, embed) => api.post('/api/discord/dm', { userId, content, embed }),
  addRole: (userId, roleId) => api.post(`/api/discord/members/${userId}/roles/add`, { roleId }),
  removeRole: (userId, roleId) => api.post(`/api/discord/members/${userId}/roles/remove`, { roleId }),
  postStaffAvailability: (data) => api.post('/api/discord/staff-availability', data)
};

// Analytics endpoints
export const analytics = {
  getOverview: () => api.get('/api/analytics/overview')
};

// Partnership endpoints
export const partnerships = {
  getAll: () => api.get('/api/partnerships'),
  create: (data) => api.post('/api/partnerships', data),
  updateStatus: (id, status, notes) => api.put(`/api/partnerships/${id}/status`, { status, notes }),
  sendTerms: (id, data) => api.post(`/api/partnerships/${id}/send-terms`, data),
  announce: (id, channelId) => api.post(`/api/partnerships/${id}/announce`, { channelId }),
  announceQuick: (channelId, embedData, content) => api.post('/api/partnerships/announce-quick', { channelId, embedData, content }),
  update: (id, data) => api.put(`/api/partnerships/${id}`, data),
  delete: (id) => api.delete(`/api/partnerships/${id}`)
};

// Recruitment endpoints
export const recruitment = {
  getAll: () => api.get('/api/recruitment'),
  create: (data) => api.post('/api/recruitment', data),
  update: (id, data) => api.put(`/api/recruitment/${id}`, data),
  delete: (id) => api.delete(`/api/recruitment/${id}`)
};

// Feedback endpoints
export const feedback = {
  getAll: (params) => api.get('/api/feedback', { params }),
  create: (data) => api.post('/api/feedback', data),
  update: (id, data) => api.put(`/api/feedback/${id}`, data),
  respond: (id, response, sendDM) => api.post(`/api/feedback/${id}/respond`, { response, sendDM }),
  getDocumentation: () => api.get('/api/feedback/documentation/list'),
  createDocumentation: (data) => api.post('/api/feedback/documentation', data),
  sendDocumentation: (id, data) => api.post(`/api/feedback/documentation/${id}/send`, data)
};

// Roles endpoints
export const roles = {
  getReactionRoles: () => api.get('/api/roles/reaction-roles'),
  createReactionRole: (data) => api.post('/api/roles/reaction-roles', data),
  getJoinRequests: () => api.get('/api/roles/join-requests'),
  handleJoinRequest: (id, action, roleId, reason) => api.post(`/api/roles/join-requests/${id}/handle`, { action, roleId, reason }),
  getNicknameRules: () => api.get('/api/roles/nickname-rules'),
  createNicknameRule: (data) => api.post('/api/roles/nickname-rules', data),
  delete: (id) => api.delete(`/api/roles/${id}`)
};

// Announcements endpoints
export const announcements = {
  getScheduled: () => api.get('/api/announcements'),
  create: (data) => api.post('/api/announcements', data),
  update: (id, data) => api.put(`/api/announcements/${id}`, data),
  cancel: (id) => api.delete(`/api/announcements/${id}`),
  sendToMultiple: (channelIds, content, embedData, mentions) => api.post('/api/announcements/announce', { channelIds, content, embedData, mentions })
};

// Config endpoints
export const config = {
  get: () => api.get('/api/config'),
  update: (data) => api.put('/api/config', data),
  getDiscordRoles: () => api.get('/api/config/discord-roles'),
  getDiscordChannels: () => api.get('/api/config/discord-channels'),
  getDiscordCategories: () => api.get('/api/discord/categories'),
  getGeneralSettings: () => api.get('/api/config/general'),
  updateGeneralSettings: (data) => api.put('/api/config/general', data)
};

// Upload endpoints
export const upload = {
  image: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  images: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post('/api/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  list: () => api.get('/api/upload/list'),
  delete: (filename) => api.delete(`/api/upload/${filename}`)
};

// Custom Commands endpoints
export const customCommands = {
  getAll: () => api.get('/api/custom-commands'),
  getBuiltIn: () => api.get('/api/custom-commands/built-in'),
  updateBuiltIn: (commandName, data) => api.put(`/api/custom-commands/built-in/${commandName}`, data),
  resetBuiltIn: (commandName) => api.delete(`/api/custom-commands/built-in/${commandName}`),
  create: (data) => api.post('/api/custom-commands', data),
  update: (id, data) => api.put(`/api/custom-commands/${id}`, data),
  delete: (id) => api.delete(`/api/custom-commands/${id}`)
};

export default api;

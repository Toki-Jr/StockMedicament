const { getIo } = require('../config/socket');

const NotificationService = {
  // Un seul user
  toUser(userId, type, message, data = {}) {
    getIo().to(`user:${userId}`).emit('notification', { type, message, data, at: new Date() });
  },
  // All user meme role
  toRole(role, type, message, data = {}) {
    getIo().to(`role:${role}`).emit('notification', { type, message, data, at: new Date() });
  },
  // All user connected
  toAll(type, message, data = {}) {
    getIo().emit('notification', { type, message, data, at: new Date() });
  },
};

module.exports = NotificationService;

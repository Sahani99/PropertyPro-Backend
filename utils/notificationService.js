const Notification = require('../models/Notification.model');
const User = require('../models/User.model');

const NOTIFICATION_TYPES = {
  NEW_PROPERTY: 'NEW_PROPERTY',
  VISIT_REQUEST_STATUS: 'VISIT_REQUEST_STATUS',
};

async function notifyAllUsers(type, message) {
  if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
    console.error(`[Notification Service] Invalid notification type: ${type}`);
    return;
  }

  try {
    const users = await User.find({}).select('_id');
    if (users.length === 0) {
      console.warn("[Notification Service] No users found to notify.");
      return;
    }

    const notifications = users.map(user => ({
      userId: user._id,
      type,
      message,
      isRead: false,
      createdAt: new Date(),
    }));

    await Notification.insertMany(notifications);
    console.log(`[Notification Service] Sent "${type}" notification to ${users.length} users.`);
  } catch (error) {
    console.error("[Notification Service] Error:", error);
  }
}

module.exports = {
  notifyAllUsers,
  ...NOTIFICATION_TYPES
};
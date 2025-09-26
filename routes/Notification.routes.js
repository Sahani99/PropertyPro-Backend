const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/:userId/unread', notificationController.getUnreadNotifications);
router.get('/:userId', notificationController.getNotificationsByUser);
router.patch('/:id/read', notificationController.markAsRead);
router.get('/:userId/unread', notificationController.getUnreadNotifications);


module.exports = router;

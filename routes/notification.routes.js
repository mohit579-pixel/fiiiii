import { Router } from 'express';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../controller/notification.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Routes
router.post('/', createNotification);
router.get('/user/:userId', getUserNotifications);
router.patch('/:notificationId/read', markNotificationAsRead);
router.patch('/user/:userId/read-all', markAllNotificationsAsRead);
router.delete('/:notificationId', deleteNotification);

export default router; 
import Notification from '../models/notification.model.js';
import  ApiError  from '../utils/ApiError.js';
import  ApiResponse  from '../utils/ApiResponse.js';
import  asyncHandler  from '../utils/asyncHandler.js';

// Create a new notification
export const createNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type, data, linkTo } = req.body;

  if (!userId || !title || !message) {
    throw new ApiError(400, 'User ID, title, and message are required');
  }

  const notification = await Notification.create({
    userId,
    title,
    message,
    type: type || 'general',
    data: data || {},
    linkTo: linkTo || '',
  });

  return res
    .status(201)
    .json(new ApiResponse(201, notification, 'Notification created successfully'));
});

// Get all notifications for a user
export const getUserNotifications = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, unreadOnly = false } = req.query;

  const options = {
    userId,
  };

  if (unreadOnly === 'true') {
    options.isRead = false;
  }

  const notifications = await Notification.find(options)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const totalCount = await Notification.countDocuments(options);
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return res.status(200).json(
    new ApiResponse(200, {
      notifications,
      pagination: {
        total: totalCount,
        unreadCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    })
  );
});

// Mark notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    {
      isRead: true,
    },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notification, 'Notification marked as read'));
});

// Mark all notifications as read
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'All notifications marked as read'));
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findByIdAndDelete(notificationId);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Notification deleted successfully'));
});

// Create appointment notification helper
export const createAppointmentNotification = async (userId, appointment, action) => {
  try {
    let title, message;
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };
    
    // Format time from 24-hour format to 12-hour format
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };
    
    const appointmentDate = formatDate(appointment.date);
    const appointmentTime = formatTime(appointment.startTime);
    
    switch (action) {
      case 'booked':
        title = 'New Appointment Booked';
        message = `Your appointment has been scheduled for ${appointmentDate} at ${appointmentTime}`;
        break;
      case 'confirmed':
        title = 'Appointment Confirmed';
        message = `Your appointment for ${appointmentDate} at ${appointmentTime} has been confirmed`;
        break;
      case 'cancelled':
        title = 'Appointment Cancelled';
        message = `Your appointment for ${appointmentDate} at ${appointmentTime} has been cancelled`;
        break;
      case 'reminder':
        title = 'Appointment Reminder';
        message = `Reminder: You have an appointment scheduled for ${appointmentDate} at ${appointmentTime}`;
        break;
      default:
        title = 'Appointment Update';
        message = `Your appointment for ${appointmentDate} at ${appointmentTime} has been updated`;
    }
    
    await Notification.create({
      userId,
      title,
      message,
      type: 'appointment',
      data: { appointment },
      linkTo: '/patient/calendar',
    });
    
    return true;
  } catch (error) {
    console.error('Error creating appointment notification:', error);
    return false;
  }
}; 
const notificationService = require('../../domain/services/notification_service');
const { validationResult } = require('express-validator');

/**
 * Get all notifications for authenticated user
 */
const getAllNotifications = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array(),
          status: 400
        }
      });
    }

    const userId = req.user.id;
    const filters = {
      type: req.query.type,
      is_read: req.query.is_read === 'true' ? true : req.query.is_read === 'false' ? false : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const notifications = await notificationService.getNotifications(userId, filters);

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get grouped notifications about comments on user's threads
 */
const getThreadCommentNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const groupedNotifications = await notificationService.getThreadCommentNotifications(userId);

    res.status(200).json({
      success: true,
      count: groupedNotifications.length,
      grouped_notifications: groupedNotifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get grouped notifications about replies on user's comments
 */
const getCommentReplyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const groupedNotifications = await notificationService.getCommentReplyNotifications(userId);

    res.status(200).json({
      success: true,
      count: groupedNotifications.length,
      grouped_notifications: groupedNotifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single notification by ID
 */
const getNotificationById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array(),
          status: 400
        }
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    const notification = await notificationService.getNotificationById(id, userId);

    if (!notification) {
      return res.status(404).json({
        error: {
          message: 'Notification not found',
          status: 404
        }
      });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new notification
 */
const createNotification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array(),
          status: 400
        }
      });
    }

    const notification = await notificationService.createNotification(req.body);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array(),
          status: 400
        }
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a single notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array(),
          status: 400
        }
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    await notificationService.deleteNotification(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all notifications for authenticated user
 */
const deleteAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await notificationService.deleteAllNotifications(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get following list for authenticated user
 */
const getFollowingList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const followingList = await notificationService.getFollowingList(userId);

    res.status(200).json({
      success: true,
      count: followingList.length,
      following: followingList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Follow a user
 */
const followUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array(),
          status: 400
        }
      });
    }

    const followerId = req.user.id;
    const { following_id } = req.body;

    if (followerId === following_id) {
      return res.status(400).json({
        error: {
          message: 'Cannot follow yourself',
          status: 400
        }
      });
    }

    const follower = await notificationService.followUser(followerId, following_id);

    res.status(201).json({
      success: true,
      message: 'User followed successfully',
      follower
    });
  } catch (error) {
    if (error.message === 'Already following this user') {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }
    next(error);
  }
};

/**
 * Unfollow a user
 */
const unfollowUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array(),
          status: 400
        }
      });
    }

    const followerId = req.user.id;
    const { following_id } = req.params;

    await notificationService.unfollowUser(followerId, following_id);

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle bell notification for a followed user
 */
const toggleBellNotification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array(),
          status: 400
        }
      });
    }

    const followerId = req.user.id;
    const { following_id } = req.params;
    const { bell_enabled } = req.body;

    const follower = await notificationService.toggleBellNotification(followerId, following_id, bell_enabled);

    res.status(200).json({
      success: true,
      message: `Bell notification ${bell_enabled ? 'enabled' : 'disabled'} successfully`,
      follower
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotifications,
  getThreadCommentNotifications,
  getCommentReplyNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getFollowingList,
  followUser,
  unfollowUser,
  toggleBellNotification,
  getUnreadCount
};

const { body, param, query } = require('express-validator');

const createNotificationValidator = [
  body('recipient_id')
    .notEmpty()
    .withMessage('Recipient ID is required')
    .isUUID()
    .withMessage('Recipient ID must be a valid UUID'),
  body('sender_id')
    .optional()
    .isUUID()
    .withMessage('Sender ID must be a valid UUID'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['thread_comment', 'comment_reply', 'follow', 'mention', 'like', 'system'])
    .withMessage('Invalid notification type'),
  body('reference_id')
    .optional()
    .isUUID()
    .withMessage('Reference ID must be a valid UUID'),
  body('reference_type')
    .optional()
    .isIn(['thread', 'comment', 'resource', 'collection'])
    .withMessage('Invalid reference type')
];

const notificationIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID is required')
    .isUUID()
    .withMessage('Notification ID must be a valid UUID')
];

const getNotificationsValidator = [
  query('type')
    .optional()
    .isIn(['thread_comment', 'comment_reply', 'follow', 'mention', 'like', 'system'])
    .withMessage('Invalid notification type'),
  query('is_read')
    .optional()
    .isBoolean()
    .withMessage('is_read must be a boolean'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const followUserValidator = [
  body('following_id')
    .notEmpty()
    .withMessage('Following ID is required')
    .isUUID()
    .withMessage('Following ID must be a valid UUID')
];

const unfollowUserValidator = [
  param('following_id')
    .notEmpty()
    .withMessage('Following ID is required')
    .isUUID()
    .withMessage('Following ID must be a valid UUID')
];

const toggleBellValidator = [
  param('following_id')
    .notEmpty()
    .withMessage('Following ID is required')
    .isUUID()
    .withMessage('Following ID must be a valid UUID'),
  body('bell_enabled')
    .notEmpty()
    .withMessage('bell_enabled is required')
    .isBoolean()
    .withMessage('bell_enabled must be a boolean')
];

const markAsReadValidator = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID is required')
    .isUUID()
    .withMessage('Notification ID must be a valid UUID')
];

module.exports = {
  createNotificationValidator,
  notificationIdValidator,
  getNotificationsValidator,
  followUserValidator,
  unfollowUserValidator,
  toggleBellValidator,
  markAsReadValidator
};

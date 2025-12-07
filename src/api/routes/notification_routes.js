const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification_controller');
const { authenticateJWT } = require('../middlewares/auth_middleware');
const {
  createNotificationValidator,
  notificationIdValidator,
  getNotificationsValidator,
  followUserValidator,
  unfollowUserValidator,
  toggleBellValidator,
  markAsReadValidator
} = require('../validators/notification_validator');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints
 * 
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Notification ID
 *         recipient_id:
 *           type: string
 *           format: uuid
 *           description: Recipient student ID
 *         sender_id:
 *           type: string
 *           format: uuid
 *           description: Sender student ID
 *         title:
 *           type: string
 *           description: Notification title
 *         type:
 *           type: string
 *           enum: [thread_comment, comment_reply, follow, mention, like, system]
 *           description: Notification type
 *         reference_id:
 *           type: string
 *           format: uuid
 *           description: Referenced entity ID
 *         reference_type:
 *           type: string
 *           enum: [thread, comment, resource, collection]
 *           description: Referenced entity type
 *         is_read:
 *           type: boolean
 *           description: Read status
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         sender:
 *           type: object
 *           description: Sender details
 *     
 *     GroupedNotification:
 *       type: object
 *       properties:
 *         thread_id:
 *           type: string
 *           format: uuid
 *           description: Thread ID (for thread_comment type)
 *         thread_title:
 *           type: string
 *           description: Thread title
 *         comment_id:
 *           type: string
 *           format: uuid
 *           description: Comment ID (for comment_reply type)
 *         comment_preview:
 *           type: string
 *           description: Comment preview text
 *         type:
 *           type: string
 *           enum: [thread_comment, comment_reply]
 *         count:
 *           type: integer
 *           description: Number of notifications in group
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         latest_created_at:
 *           type: string
 *           format: date-time
 *         has_unread:
 *           type: boolean
 *     
 *     Follower:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         follower_id:
 *           type: string
 *           format: uuid
 *         following_id:
 *           type: string
 *           format: uuid
 *         bell_enabled:
 *           type: boolean
 *           description: Bell notification enabled status
 *         created_at:
 *           type: string
 *           format: date-time
 *         following:
 *           type: object
 *           description: Following user details
 * 
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * security:
 *   - BearerAuth: []
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [thread_comment, comment_reply, follow, mention, like, system]
 *         description: Filter by notification type
 *       - in: query
 *         name: is_read
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Limit number of results
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getNotificationsValidator, notificationController.getAllNotifications);

/**
 * @swagger
 * /api/notifications/grouped/thread-comments:
 *   get:
 *     summary: Get grouped notifications about comments on user's threads
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Grouped notifications by thread
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 grouped_notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GroupedNotification'
 *       401:
 *         description: Unauthorized
 */
router.get('/grouped/thread-comments', notificationController.getThreadCommentNotifications);

/**
 * @swagger
 * /api/notifications/grouped/comment-replies:
 *   get:
 *     summary: Get grouped notifications about replies on user's comments
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Grouped notifications by comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 grouped_notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GroupedNotification'
 *       401:
 *         description: Unauthorized
 */
router.get('/grouped/comment-replies', notificationController.getCommentReplyNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 unread_count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.put('/mark-all-read', notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/delete-all:
 *   delete:
 *     summary: Delete all notifications for authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.delete('/delete-all', notificationController.deleteAllNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get a single notification by ID
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', notificationIdValidator, notificationController.getNotificationById);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient_id
 *               - title
 *               - type
 *             properties:
 *               recipient_id:
 *                 type: string
 *                 format: uuid
 *               sender_id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               type:
 *                 type: string
 *                 enum: [thread_comment, comment_reply, follow, mention, like, system]
 *               reference_id:
 *                 type: string
 *                 format: uuid
 *               reference_type:
 *                 type: string
 *                 enum: [thread, comment, resource, collection]
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', createNotificationValidator, notificationController.createNotification);

/**
 * @swagger
 * /api/notifications/{id}/mark-read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/mark-read', markAsReadValidator, notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a single notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', notificationIdValidator, notificationController.deleteNotification);

/**
 * @swagger
 * /api/notifications/following:
 *   get:
 *     summary: Get following list for authenticated user
 *     tags: [Following]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of followed users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 following:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Follower'
 *       401:
 *         description: Unauthorized
 */
router.get('/following/list', notificationController.getFollowingList);

/**
 * @swagger
 * /api/notifications/following:
 *   post:
 *     summary: Follow a user
 *     tags: [Following]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - following_id
 *             properties:
 *               following_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 follower:
 *                   $ref: '#/components/schemas/Follower'
 *       400:
 *         description: Already following or validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/following', followUserValidator, notificationController.followUser);

/**
 * @swagger
 * /api/notifications/following/{following_id}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Following]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: following_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to unfollow
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.delete('/following/:following_id', unfollowUserValidator, notificationController.unfollowUser);

/**
 * @swagger
 * /api/notifications/following/{following_id}/bell:
 *   put:
 *     summary: Toggle bell notification for a followed user
 *     tags: [Following]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: following_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bell_enabled
 *             properties:
 *               bell_enabled:
 *                 type: boolean
 *                 description: Enable or disable bell notifications
 *     responses:
 *       200:
 *         description: Bell notification toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 follower:
 *                   $ref: '#/components/schemas/Follower'
 *       401:
 *         description: Unauthorized
 */
router.put('/following/:following_id/bell', toggleBellValidator, notificationController.toggleBellNotification);

module.exports = router;

const { getSupabaseClient } = require('../../infrastructure/database/supabase');
const Notification = require('../models/notification_model');
const Follower = require('../models/follower_model');

class NotificationService {
  /**
   * Get all notifications for a user with optional filters
   */
  async getNotifications(userId, filters = {}) {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('notifications')
      .select(`
        *,
        sender:students!sender_id(
          id,
          student_code,
          email,
          profiles(display_name, avatar_url)
        )
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(notification => {
      const senderData = notification.sender ? {
        id: notification.sender.id,
        student_code: notification.sender.student_code,
        email: notification.sender.email,
        display_name: notification.sender.profiles?.[0]?.display_name || notification.sender.student_code,
        avatar_url: notification.sender.profiles?.[0]?.avatar_url || null
      } : null;

      return {
        ...Notification.fromDatabase(notification).toJSON(),
        sender: senderData
      };
    });
  }

  /**
   * Get grouped notifications about comments on user's threads
   */
  async getThreadCommentNotifications(userId) {
    const supabase = getSupabaseClient();
    
    // Get notifications grouped by thread
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:students!sender_id(
          id,
          student_code,
          email,
          profiles(display_name, avatar_url)
        ),
        thread:threads!reference_id(id, title)
      `)
      .eq('recipient_id', userId)
      .eq('type', 'thread_comment')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group notifications by thread
    const grouped = {};
    data.forEach(notification => {
      const threadId = notification.reference_id;
      if (!grouped[threadId]) {
        grouped[threadId] = {
          thread_id: threadId,
          thread_title: notification.thread?.title || 'Deleted Thread',
          type: 'thread_comment',
          count: 0,
          notifications: [],
          latest_created_at: notification.created_at,
          has_unread: false
        };
      }
      
      const senderData = notification.sender ? {
        id: notification.sender.id,
        student_code: notification.sender.student_code,
        email: notification.sender.email,
        display_name: notification.sender.profiles?.[0]?.display_name || notification.sender.student_code,
        avatar_url: notification.sender.profiles?.[0]?.avatar_url || null
      } : null;
      
      grouped[threadId].count++;
      grouped[threadId].notifications.push({
        ...Notification.fromDatabase(notification).toJSON(),
        sender: senderData
      });
      if (!notification.is_read) {
        grouped[threadId].has_unread = true;
      }
    });

    return Object.values(grouped);
  }

  /**
   * Get grouped notifications about replies on user's comments
   */
  async getCommentReplyNotifications(userId) {
    const supabase = getSupabaseClient();
    
    // Get notifications grouped by parent comment
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:students!sender_id(
          id,
          student_code,
          email,
          profiles(display_name, avatar_url)
        ),
        comment:comments!reference_id(id, content)
      `)
      .eq('recipient_id', userId)
      .eq('type', 'comment_reply')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group notifications by parent comment
    const grouped = {};
    data.forEach(notification => {
      const commentId = notification.reference_id;
      if (!grouped[commentId]) {
        grouped[commentId] = {
          comment_id: commentId,
          comment_preview: notification.comment?.content 
            ? notification.comment.content.substring(0, 50) + '...' 
            : 'Deleted Comment',
          type: 'comment_reply',
          count: 0,
          notifications: [],
          latest_created_at: notification.created_at,
          has_unread: false
        };
      }
      
      const senderData = notification.sender ? {
        id: notification.sender.id,
        student_code: notification.sender.student_code,
        email: notification.sender.email,
        display_name: notification.sender.profiles?.[0]?.display_name || notification.sender.student_code,
        avatar_url: notification.sender.profiles?.[0]?.avatar_url || null
      } : null;
      
      grouped[commentId].count++;
      grouped[commentId].notifications.push({
        ...Notification.fromDatabase(notification).toJSON(),
        sender: senderData
      });
      if (!notification.is_read) {
        grouped[commentId].has_unread = true;
      }
    });

    return Object.values(grouped);
  }

  /**
   * Get a single notification by ID
   */
  async getNotificationById(notificationId, userId) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:students!sender_id(
          id,
          student_code,
          email,
          profiles(display_name, avatar_url)
        )
      `)
      .eq('id', notificationId)
      .eq('recipient_id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    const senderData = data.sender ? {
      id: data.sender.id,
      student_code: data.sender.student_code,
      email: data.sender.email,
      display_name: data.sender.profiles?.[0]?.display_name || data.sender.student_code,
      avatar_url: data.sender.profiles?.[0]?.avatar_url || null
    } : null;

    return {
      ...Notification.fromDatabase(data).toJSON(),
      sender: senderData
    };
  }

  /**
   * Create a new notification
   */
  async createNotification(notificationData) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: notificationData.recipient_id,
        sender_id: notificationData.sender_id,
        title: notificationData.title,
        type: notificationData.type,
        reference_id: notificationData.reference_id,
        reference_type: notificationData.reference_type
      })
      .select()
      .single();

    if (error) throw error;
    return Notification.fromDatabase(data);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId, userId) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('recipient_id', userId)
      .select()
      .single();

    if (error) throw error;
    return Notification.fromDatabase(data);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(notificationId, userId) {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('recipient_id', userId);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId) {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('recipient_id', userId);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Get following list for a user
   */
  async getFollowingList(userId) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('followers')
      .select('*, following:students!following_id(id, student_code, full_name, email, avatar_url)')
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(follower => ({
      ...Follower.fromDatabase(follower).toJSON(),
      following: follower.following
    }));
  }

  /**
   * Follow a user
   */
  async followUser(followerId, followingId) {
    const supabase = getSupabaseClient();
    
    // Check if already following
    const { data: existing } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      throw new Error('Already following this user');
    }

    const { data, error } = await supabase
      .from('followers')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        bell_enabled: true
      })
      .select('*, following:students!following_id(id, student_code, full_name, email, avatar_url)')
      .single();

    if (error) throw error;

    return {
      ...Follower.fromDatabase(data).toJSON(),
      following: data.following
    };
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId, followingId) {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Toggle bell notifications for a followed user
   */
  async toggleBellNotification(followerId, followingId, bellEnabled) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('followers')
      .update({ bell_enabled: bellEnabled })
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .select('*, following:students!following_id(id, student_code, full_name, email, avatar_url)')
      .single();

    if (error) throw error;

    return {
      ...Follower.fromDatabase(data).toJSON(),
      following: data.following
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    const supabase = getSupabaseClient();
    
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { unread_count: count };
  }
}

module.exports = new NotificationService();

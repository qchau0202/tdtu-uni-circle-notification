const { getSupabaseClient } = require('../../infrastructure/database/supabase');

const getAllNotifications = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*');

    if (error) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    res.status(200).json({
      notifications: data
    });
  } catch (error) {
    next(error);
  }
};

const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        error: {
          message: 'Notification not found',
          status: 404
        }
      });
    }

    res.status(200).json({
      notification: data
    });
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const notificationData = req.body;
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select();

    if (error) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    res.status(201).json({
      message: 'Notification created successfully',
      notification: data[0]
    });
  } catch (error) {
    next(error);
  }
};

const updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notificationData = req.body;
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .update(notificationData)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    res.status(200).json({
      message: 'Notification updated successfully',
      notification: data[0]
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    res.status(200).json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification
};

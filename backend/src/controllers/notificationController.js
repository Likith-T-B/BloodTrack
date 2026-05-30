const db = require('../config/db');

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    if (db.isMock()) {
      const notifications = db.mockDb.readTable('notifications');
      const results = notifications.filter(n => n.user_id === req.user.id);
      return res.status(200).json({ success: true, data: results });
    } else {
      const rows = await db.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );
      return res.status(200).json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
exports.markRead = async (req, res) => {
  const notificationId = parseFloat(req.params.id);

  try {
    if (db.isMock()) {
      const notifications = db.mockDb.readTable('notifications');
      const idx = notifications.findIndex(n => n.id === notificationId || n.id === req.params.id);
      
      if (idx !== -1) {
        notifications[idx].is_read = 1;
        db.mockDb.writeTable('notifications', notifications);
      }
      return res.status(200).json({ success: true, message: 'Notification marked read' });
    } else {
      await db.query(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      return res.status(200).json({ success: true, message: 'Notification marked read' });
    }
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

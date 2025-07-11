const pool = require('../db');

const logAdminActivity = (action, targetId = null, details = {}) => {
  return async (req, res, next) => {
    try {
      const adminId = req.user.id; // Assuming req.user.id is set by authenticateUser middleware
      await pool.query(
        'INSERT INTO admin_activity_log (admin_id, action, target_id, details) VALUES ($1, $2, $3, $4)',
        [adminId, action, targetId, details]
      );
      next();
    } catch (error) {
      console.error('Error logging admin activity:', error);
      // Do not block the request if logging fails
      next();
    }
  };
};

const requestPermission = (actionType, targetTable, targetId, requestDetails = {}) => {
  return async (req, res, next) => {
    try {
      const requesterAdminId = req.user.id;
      const { rows } = await pool.query(
        'INSERT INTO permission_requests (requester_admin_id, action_type, target_table, target_id, request_details) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
        [requesterAdminId, actionType, targetTable, targetId, requestDetails]
      );
      res.status(202).json({ message: 'Permission request sent for approval', requestId: rows[0].id });
    } catch (error) {
      console.error('Error requesting permission:', error);
      res.status(500).json({ error: 'Failed to send permission request' });
    }
  };
};

module.exports = { logAdminActivity, requestPermission };
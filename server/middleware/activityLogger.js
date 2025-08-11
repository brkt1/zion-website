const supabase = require("../supabaseClient");

const logAdminActivity = (action, targetId = null, details = {}) => {
  return async (req, res, next) => {
    try {
      const adminId = req.user.id; // Assuming req.user.id is set by authenticateUser middleware
      const { error } = await supabase.from("admin_activity_log").insert({
        admin_id: adminId,
        action,
        target_id: targetId,
        details,
      });
      if (error) {
        console.error("Supabase error logging admin activity:", error);
      }
      next();
    } catch (error) {
      console.error("Error logging admin activity:", error);
      // Do not block the request if logging fails
      next();
    }
  };
};

const requestPermission = (
  actionType,
  targetTable,
  targetId,
  requestDetails = {}
) => {
  return async (req, res, next) => {
    try {
      const requesterAdminId = req.user.id;
      const { data, error } = await supabase
        .from("permission_requests")
        .insert({
          requester_admin_id: requesterAdminId,
          action_type: actionType,
          target_table: targetTable,
          target_id: targetId,
          request_details: requestDetails,
        })
        .select();
      if (error) {
        console.error("Supabase error requesting permission:", error);
        return res
          .status(500)
          .json({ error: "Failed to send permission request" });
      }
      res
        .status(202)
        .json({
          message: "Permission request sent for approval",
          requestId: data[0]?.id,
        });
    } catch (error) {
      console.error("Error requesting permission:", error);
      res.status(500).json({ error: "Failed to send permission request" });
    }
  };
};

module.exports = { logAdminActivity, requestPermission };

const express = require("express");
// Removed pool import; using Supabase for all DB operations
const {
  authenticateUser,
  requireSuperAdmin,
} = require("../middleware/authMiddleware");
const { logAdminActivity } = require("../middleware/activityLogger");
const supabase = require("../supabaseClient");
const requirePermission = require("../middleware/permissionMiddleware");

const router = express.Router();
// System Settings routes
// GET all system settings
router.get(
  "/settings",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("key, value, updated_at")
        .order("key", { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch system settings:", error);
      res.status(500).json({ error: "Failed to fetch system settings" });
    }
  }
);

// PUT update a system setting
router.put(
  "/settings/:key",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json({ message: "Setting updated" });
    } catch (error) {
      console.error("Failed to update system setting:", error);
      res.status(500).json({ error: "Failed to update system setting" });
    }
  }
);

router.get(
  "/dashboard",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    try {
      // Fetch all users with creation timestamps and roles
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, role, created_at, email");
      if (usersError) throw usersError;

      // Count of users by role
      const roleCounts = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {});
      const totalUsers = users.length;
      const cafeOwnersCount = roleCounts["CAFE_OWNER"] || 0;
      const recentSignups = users.filter((u) => {
        const created = new Date(u.created_at);
        return Date.now() - created.getTime() <= 24 * 60 * 60 * 1000;
      }).length;
      const newUsersLast7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const count = users.filter((u) =>
          new Date(u.created_at).toISOString().startsWith(dateStr)
        ).length;
        newUsersLast7Days.push({ date: dateStr, count });
      }
      res.setHeader("Content-Type", "application/json");
      res.json({
        totalUsers,
        activeSessions: 0,
        cafeOwnersCount,
        recentSignups,
        systemHealth: "operational",
        newUsersLast7Days,
        userDistribution: Object.entries(roleCounts).map(([role, count]) => ({
          role,
          count,
        })),
      });
    } catch (error) {
      console.error("Super Admin dashboard error:", error);
      res.status(500).json({ error: "Failed to load Super Admin dashboard" });
    }
  }
);

// Get all admin activity logs
router.get(
  "/activity-log",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("admin_activity_log")
        .select("id, admin_id, action, target_id, details, timestamp")
        .order("timestamp", { ascending: false });
      if (error) throw error;
      // Optionally join with profiles for admin_role
      // You can fetch roles separately if needed
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch activity log:", error);
      res.status(500).json({ error: "Failed to fetch activity log" });
    }
  }
);

// Get all pending permission requests
router.get(
  "/permission-requests",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("permission_requests")
        .select(
          "id, requester_admin_id, action_type, target_table, target_id, request_details, status, requested_at"
        )
        .eq("status", "PENDING")
        .order("requested_at", { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch permission requests:", error);
      res.status(500).json({ error: "Failed to fetch permission requests" });
    }
  }
);

// Approve a permission request
router.post(
  "/permission-requests/:id/approve",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { id } = req.params;
    const superAdminId = req.user.id;

    try {
      const { data: requestRows, error: requestError } = await supabase
        .from("permission_requests")
        .select("*")
        .eq("id", id)
        .eq("status", "PENDING");
      if (requestError) throw requestError;
      const request = requestRows && requestRows[0];
      if (!request) {
        return res
          .status(404)
          .json({ error: "Permission request not found or already processed" });
      }
      // Execute the requested action
      let success = false;
      let message = "";
      switch (request.action_type) {
        case "DELETE_CARD":
          await supabase.from("cards").delete().eq("id", request.target_id);
          success = true;
          message = "Card deleted successfully";
          break;
        case "DELETE_CERTIFICATE":
          await supabase
            .from("certificates")
            .delete()
            .eq("id", request.target_id);
          success = true;
          message = "Certificate deleted successfully";
          break;
        case "DELETE_GAME_TYPE":
          await supabase
            .from("game_types")
            .delete()
            .eq("id", request.target_id);
          success = true;
          message = "Game type deleted successfully";
          break;
        case "DELETE_PROFILE":
          await supabase.from("profiles").delete().eq("id", request.target_id);
          success = true;
          message = "Profile deleted successfully";
          break;
        case "DELETE_QUESTION":
          await supabase.from("questions").delete().eq("id", request.target_id);
          success = true;
          message = "Question deleted successfully";
          break;
        case "DELETE_SCORE":
          await supabase.from("scores").delete().eq("id", request.target_id);
          success = true;
          message = "Score deleted successfully";
          break;
        case "DELETE_WINNER_ENTRY":
          await supabase
            .from("certificates")
            .delete()
            .eq("id", request.target_id);
          success = true;
          message = "Winner entry deleted successfully";
          break;
        default:
          return res.status(400).json({ error: "Unknown action type" });
      }
      if (success) {
        await supabase
          .from("permission_requests")
          .update({
            status: "APPROVED",
            responded_by_super_admin_id: superAdminId,
            responded_at: new Date().toISOString(),
          })
          .eq("id", id);
        logAdminActivity("APPROVED_PERMISSION_REQUEST", id, {
          actionType: request.action_type,
          targetId: request.target_id,
        })(req, res, () => {});
        res.json({ message });
      } else {
        res.status(500).json({ error: "Failed to execute requested action" });
      }
    } catch (error) {
      console.error("Error approving permission request:", error);
      res.status(500).json({ error: "Failed to approve permission request" });
    }
  }
);

// Reject a permission request
router.post(
  "/permission-requests/:id/reject",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const superAdminId = req.user.id;

    try {
      const { data, error } = await supabase
        .from("permission_requests")
        .update({
          status: "REJECTED",
          responded_by_super_admin_id: superAdminId,
          responded_at: new Date().toISOString(),
          response_reason: reason,
        })
        .eq("id", id)
        .eq("status", "PENDING")
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        return res
          .status(404)
          .json({ error: "Permission request not found or already processed" });
      }
      logAdminActivity("REJECTED_PERMISSION_REQUEST", id, {
        actionType: data[0].action_type,
        targetId: data[0].target_id,
        reason,
      })(req, res, () => {});
      res.json({ message: "Permission request rejected" });
    } catch (error) {
      console.error("Error rejecting permission request:", error);
      res.status(500).json({ error: "Failed to reject permission request" });
    }
  }
);

router.post(
  "/create-admin",
  authenticateUser,
  requirePermission("can_create_admin_users"),
  async (req, res) => {
    const { email, password, role, permissions } = req.body;

    try {
      // Create user in Supabase Auth
      const { data: signUpData, error: signUpError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Automatically confirm email
        });
      if (signUpError) {
        throw new Error(signUpError.message);
      }
      const newUserId = signUpData.user.id;
      // Set role in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: newUserId, role })
        .select();
      if (profileError) {
        await supabase.auth.admin.deleteUser(newUserId);
        throw new Error(profileError.message);
      }
      // Assign granular permissions
      if (permissions && permissions.length > 0) {
        // Get permission ids
        const { data: permData, error: permError } = await supabase
          .from("permissions")
          .select("id, name")
          .in("name", permissions);
        if (permError) throw permError;
        const permRows = permData || [];
        const profilePerms = permRows.map((p) => ({
          profile_id: newUserId,
          permission_id: p.id,
        }));
        if (profilePerms.length > 0) {
          const { error: ppError } = await supabase
            .from("profile_permissions")
            .insert(profilePerms);
          if (ppError) throw ppError;
        }
      }
      logAdminActivity("CREATED_ADMIN_USER", newUserId, {
        email,
        role,
        permissions,
      })(req, res, () => {});
      res.status(201).json({
        message: "Admin user created successfully",
        userId: newUserId,
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to create admin user" });
    }
  }
);

// Get all available permissions
router.get(
  "/permissions",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("id, name, description")
        .order("name", { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  }
);

module.exports = router;

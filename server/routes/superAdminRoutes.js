const express = require("express");
const pool = require("../db");
const {
  authenticateUser,
  requireSuperAdmin,
} = require("../middleware/authMiddleware");
const { logAdminActivity } = require("../middleware/activityLogger");
const supabase = require("../supabaseClient");
const { requirePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();
// System Settings routes
// GET all system settings
router.get(
  "/settings",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT key, value, updated_at FROM public.system_settings ORDER BY key`
      );
      res.json(rows);
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
      const { rowCount } = await pool.query(
        `UPDATE public.system_settings SET value = $1, updated_at = NOW() WHERE key = $2`,
        [value, key]
      );
      if (rowCount === 0) {
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
      const { rows: allUsers } = await pool.query(`
      SELECT u.id, u.email, p.role, u.created_at
      FROM auth.users u
      LEFT JOIN public.profiles p ON p.id = u.id
      ORDER BY u.created_at DESC
    `);
      // Count of users by role
      const { rows: roleCounts } = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM public.profiles
      GROUP BY role
    `);
      // Compute dashboard metrics
      const totalUsers = allUsers.length;
      // roleCounts.count may be string, parse to integer
      const cafeOwnersCount = parseInt(
        roleCounts.find((rc) => rc.role === "CAFE_OWNER")?.count || "0",
        10
      );
      const recentSignups = allUsers.filter((u) => {
        // u.created_at returned as timestamp string
        const created = new Date(u.created_at);
        return Date.now() - created.getTime() <= 24 * 60 * 60 * 1000;
      }).length;
      const newUsersLast7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const count = allUsers.filter((u) =>
          // compare date prefix of created_at timestamp
          new Date(u.created_at).toISOString().startsWith(dateStr)
        ).length;
        newUsersLast7Days.push({ date: dateStr, count });
      }
      res.json({
        totalUsers,
        activeSessions: 0,
        cafeOwnersCount,
        recentSignups,
        systemHealth: "operational",
        newUsersLast7Days,
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
      const { rows } = await pool.query(`
      SELECT
        al.id,
        p.role AS admin_role,
        al.action,
        al.target_id,
        al.details,
        al.timestamp
      FROM admin_activity_log al
      JOIN public.profiles p ON p.id = al.admin_id
      ORDER BY al.timestamp DESC
    `);
      res.json(rows);
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
      const { rows } = await pool.query(`
      SELECT
        pr.id,
        p.role AS requester_role,
        pr.action_type,
        pr.target_table,
        pr.target_id,
        pr.request_details,
        pr.status,
        pr.requested_at
      FROM permission_requests pr
      JOIN profiles p ON pr.requester_admin_id = p.id
      WHERE pr.status = 'PENDING'
      ORDER BY pr.requested_at ASC
    `);
      res.json(rows);
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
      const { rows: requestRows } = await pool.query(
        `SELECT * FROM permission_requests WHERE id = $1 AND status = 'PENDING'`,
        [id]
      );
      const request = requestRows[0];

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
          await pool.query("DELETE FROM cards WHERE id = $1", [
            request.target_id,
          ]);
          success = true;
          message = "Card deleted successfully";
          break;
        case "DELETE_CERTIFICATE":
          await pool.query("DELETE FROM certificates WHERE id = $1", [
            request.target_id,
          ]);
          success = true;
          message = "Certificate deleted successfully";
          break;
        case "DELETE_GAME_TYPE":
          await pool.query("DELETE FROM game_types WHERE id = $1", [
            request.target_id,
          ]);
          success = true;
          message = "Game type deleted successfully";
          break;
        case "DELETE_PROFILE":
          await pool.query("DELETE FROM profiles WHERE id = $1", [
            request.target_id,
          ]);
          // Optionally delete from auth.users if desired, but be careful
          success = true;
          message = "Profile deleted successfully";
          break;
        case "DELETE_QUESTION":
          await pool.query("DELETE FROM questions WHERE id = $1", [
            request.target_id,
          ]);
          success = true;
          message = "Question deleted successfully";
          break;
        case "DELETE_SCORE":
          await pool.query("DELETE FROM scores WHERE id = $1", [
            request.target_id,
          ]);
          success = true;
          message = "Score deleted successfully";
          break;
        case "DELETE_WINNER_ENTRY":
          await pool.query("DELETE FROM certificates WHERE id = $1", [
            request.target_id,
          ]); // Assuming winner entries are certificates
          success = true;
          message = "Winner entry deleted successfully";
          break;
        // Add other action types as needed
        default:
          return res.status(400).json({ error: "Unknown action type" });
      }

      if (success) {
        await pool.query(
          `UPDATE permission_requests SET status = 'APPROVED', responded_by_super_admin_id = $1, responded_at = NOW() WHERE id = $2`,
          [superAdminId, id]
        );
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
      const { rows } = await pool.query(
        `UPDATE permission_requests SET status = 'REJECTED', responded_by_super_admin_id = $1, responded_at = NOW(), response_reason = $2 WHERE id = $3 AND status = 'PENDING' RETURNING *;`,
        [superAdminId, reason, id]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Permission request not found or already processed" });
      }

      logAdminActivity("REJECTED_PERMISSION_REQUEST", id, {
        actionType: rows[0].action_type,
        targetId: rows[0].target_id,
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

      // Set role in public.profiles table
      const { error: profileError } = await pool.query(
        "INSERT INTO profiles (id, role) VALUES ($1, $2)",
        [newUserId, role]
      );

      if (profileError) {
        // If profile creation fails, consider deleting the user from auth.users
        await supabase.auth.admin.deleteUser(newUserId);
        throw new Error(profileError.message);
      }

      // Assign granular permissions
      if (permissions && permissions.length > 0) {
        const permissionInserts = permissions.map(
          (permName) =>
            `(SELECT id FROM permissions WHERE name = '${permName}')`
        );
        await pool.query(`
        INSERT INTO profile_permissions (profile_id, permission_id)
        VALUES ${permissionInserts
          .map((p) => `('${newUserId}', ${p})`)
          .join(",")};
      `);
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
      const { rows } = await pool.query(
        "SELECT id, name, description FROM permissions ORDER BY name ASC"
      );
      res.json(rows);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  }
);

module.exports = router;

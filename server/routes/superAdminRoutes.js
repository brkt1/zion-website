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

// Get all permissions
router.get(
  "/permissions",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  }
);

// Get role permissions
router.get(
  "/role-permissions",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*");
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
      res.status(500).json({ error: "Failed to fetch role permissions" });
    }
  }
);

// Create/Update role permissions
router.post(
  "/role-permissions",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { role, permission_id } = req.body;
    const superAdminId = req.user.id;

    try {
      const { data, error } = await supabase
        .from("role_permissions")
        .insert({ role, permission_id })
        .select();
      
      if (error) throw error;
      
      // Log the activity
      await logAdminActivity(superAdminId, "GRANT_ROLE_PERMISSION", null, {
        role,
        permission_id,
        action: "granted"
      });
      
      res.json({ message: "Role permission granted successfully" });
    } catch (error) {
      console.error("Failed to grant role permission:", error);
      res.status(500).json({ error: "Failed to grant role permission" });
    }
  }
);

// Delete role permissions
router.delete(
  "/role-permissions",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { role, permission_id } = req.body;
    const superAdminId = req.user.id;

    try {
      const { error } = await supabase
        .from("role_permissions")
        .delete()
        .match({ role, permission_id });
      
      if (error) throw error;
      
      // Log the activity
      await logAdminActivity(superAdminId, "REVOKE_ROLE_PERMISSION", null, {
        role,
        permission_id,
        action: "revoked"
      });
      
      res.json({ message: "Role permission revoked successfully" });
    } catch (error) {
      console.error("Failed to revoke role permission:", error);
      res.status(500).json({ error: "Failed to revoke role permission" });
    }
  }
);

// Get admin roles
router.get(
  "/admin-roles",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("admin_roles")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch admin roles:", error);
      res.status(500).json({ error: "Failed to fetch admin roles" });
    }
  }
);

// Create admin role
router.post(
  "/admin-roles",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { name, description, permissions } = req.body;
    const superAdminId = req.user.id;

    try {
      // Create the admin role
      const { data: roleData, error: roleError } = await supabase
        .from("admin_roles")
        .insert({ 
          name, 
          description, 
          created_by: superAdminId 
        })
        .select()
        .single();
      
      if (roleError) throw roleError;
      
      // Assign permissions to the role
      if (permissions && permissions.length > 0) {
        const rolePermissions = permissions.map(permissionId => ({
          admin_role_id: roleData.id,
          permission_id: permissionId
        }));
        
        const { error: permError } = await supabase
          .from("admin_role_permissions")
          .insert(rolePermissions);
        
        if (permError) throw permError;
      }
      
      // Log the activity
      await logAdminActivity(superAdminId, "CREATE_ADMIN_ROLE", roleData.id, {
        role_name: name,
        permissions_count: permissions?.length || 0
      });
      
      res.json({ message: "Admin role created successfully", role: roleData });
    } catch (error) {
      console.error("Failed to create admin role:", error);
      res.status(500).json({ error: "Failed to create admin role" });
    }
  }
);

// Delete admin role
router.delete(
  "/admin-roles/:id",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { id } = req.params;
    const superAdminId = req.user.id;

    try {
      // Get role info for logging
      const { data: roleData, error: roleError } = await supabase
        .from("admin_roles")
        .select("name")
        .eq("id", id)
        .single();
      
      if (roleError) throw roleError;
      
      // Delete the role (this will cascade to permissions)
      const { error } = await supabase
        .from("admin_roles")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Log the activity
      await logAdminActivity(superAdminId, "DELETE_ADMIN_ROLE", id, {
        role_name: roleData.name
      });
      
      res.json({ message: "Admin role deleted successfully" });
    } catch (error) {
      console.error("Failed to delete admin role:", error);
      res.status(500).json({ error: "Failed to delete admin role" });
    }
  }
);

// Get user permissions
router.get(
  "/user-permissions/:userId",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { userId } = req.params;

    try {
      const { data, error } = await supabase
        .from("user_permissions")
        .select(`
          id,
          user_id,
          permission_id,
          granted_at,
          granted_by,
          permissions!inner(name)
        `)
        .eq("user_id", userId);
      
      if (error) throw error;
      
      // Transform the data to include permission names
      const transformedData = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        permission_id: item.permission_id,
        permission_name: item.permissions.name,
        granted_at: item.granted_at,
        granted_by: item.granted_by
      }));
      
      res.json(transformedData);
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
      res.status(500).json({ error: "Failed to fetch user permissions" });
    }
  }
);

// Grant user permission
router.post(
  "/user-permissions",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { user_id, permission_id } = req.body;
    const superAdminId = req.user.id;

    try {
      const { data, error } = await supabase
        .from("user_permissions")
        .insert({ 
          user_id, 
          permission_id, 
          granted_by: superAdminId 
        })
        .select();
      
      if (error) throw error;
      
      // Log the activity
      await logAdminActivity(superAdminId, "GRANT_USER_PERMISSION", user_id, {
        permission_id,
        action: "granted"
      });
      
      res.json({ message: "User permission granted successfully" });
    } catch (error) {
      console.error("Failed to grant user permission:", error);
      res.status(500).json({ error: "Failed to grant user permission" });
    }
  }
);

// Revoke user permission
router.delete(
  "/user-permissions",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { user_id, permission_id } = req.body;
    const superAdminId = req.user.id;

    try {
      const { error } = await supabase
        .from("user_permissions")
        .delete()
        .match({ user_id, permission_id });
      
      if (error) throw error;
      
      // Log the activity
      await logAdminActivity(superAdminId, "REVOKE_USER_PERMISSION", user_id, {
        permission_id,
        action: "revoked"
      });
      
      res.json({ message: "User permission revoked successfully" });
    } catch (error) {
      console.error("Failed to revoke user permission:", error);
      res.status(500).json({ error: "Failed to revoke user permission" });
    }
  }
);

// Create admin user
router.post(
  "/create-admin",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { email, password, name, role, permissions } = req.body;
    const superAdminId = req.user.id;

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name }
      });
      
      if (authError) throw authError;
      
      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          name,
          email,
          role
        });
      
      if (profileError) throw profileError;
      
      // Assign additional permissions if specified
      if (permissions && permissions.length > 0) {
        const userPermissions = permissions.map(permissionId => ({
          user_id: authData.user.id,
          permission_id: permissionId,
          granted_by: superAdminId
        }));
        
        const { error: permError } = await supabase
          .from("user_permissions")
          .insert(userPermissions);
        
        if (permError) throw permError;
      }
      
      // Log the activity
      await logAdminActivity(superAdminId, "CREATE_ADMIN_USER", authData.user.id, {
        email,
        role,
        permissions_count: permissions?.length || 0
      });
      
      res.json({ message: "Admin user created successfully", user: authData.user });
    } catch (error) {
      console.error("Failed to create admin user:", error);
      res.status(500).json({ error: "Failed to create admin user" });
    }
  }
);

// Delete admin user
router.delete(
  "/delete-admin",
  authenticateUser,
  requireSuperAdmin,
  async (req, res) => {
    const { user_id } = req.body;
    const superAdminId = req.user.id;

    try {
      // Get user info for logging
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("email, role")
        .eq("id", user_id)
        .single();
      
      if (userError) throw userError;
      
      // Delete user permissions first
      const { error: permError } = await supabase
        .from("user_permissions")
        .delete()
        .eq("user_id", user_id);
      
      if (permError) throw permError;
      
      // Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user_id);
      
      if (profileError) throw profileError;
      
      // Delete user from auth (this will cascade to other tables)
      const { error: authError } = await supabase.auth.admin.deleteUser(user_id);
      
      if (authError) throw authError;
      
      // Log the activity
      await logAdminActivity(superAdminId, "DELETE_ADMIN_USER", user_id, {
        email: userData.email,
        role: userData.role
      });
      
      res.json({ message: "Admin user deleted successfully" });
    } catch (error) {
      console.error("Failed to delete admin user:", error);
      res.status(500).json({ error: "Failed to delete admin user" });
    }
  }
);

module.exports = router;

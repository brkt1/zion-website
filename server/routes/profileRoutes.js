const express = require("express");
const {
  authenticateUser,
  requireAdmin,
} = require("../middleware/authMiddleware");
const {
  logAdminActivity,
  requestPermission,
} = require("../middleware/activityLogger");
const requirePermission = require("../middleware/permissionMiddleware");

const supabase = require("../supabaseClient");
module.exports = () => {
  const router = express.Router();

  // Profile endpoint
  router.get("/", authenticateUser, async (req, res) => {
    console.log("[DEBUG] /api/profile_permissions route hit");
    console.log("[DEBUG] Authorization header:", req.headers.authorization);
    try {
      const userId = req.user.id;
      console.log("[DEBUG] User ID:", userId);

      // Query profile_permissions and join with permissions to get the name
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("profile_permissions")
        .select(`permissions(name)`)
        .eq("profile_id", userId);

      if (permissionsError) {
        console.error("Error fetching permissions:", permissionsError);
        return res.status(500).json({ error: "Failed to fetch permissions" });
      }

      // Extract the permission names from the nested structure, handling nulls
      const permissions = permissionsData
        ? permissionsData
            .map((p) => p.permissions)
            .filter(Boolean) // Filter out any null permission objects
        : [];

      console.log("[DEBUG] Permissions data:", permissions);
      res.json(permissions);
    } catch (error) {
      console.error("Permissions fetch error:", error.message, error.stack);
      res
        .status(500)
        .json({ error: "Failed to fetch permissions", details: error.message });
    }
  });

  // Admin: Get all profile permissions
  router.get("/all", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("profile_permissions")
        .select("*");
      if (error) {
        return res
          .status(500)
          .json({ error: "Failed to fetch all profile permissions" });
      }
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch all profile permissions:", error.message);
      res
        .status(500)
        .json({ error: "Failed to fetch all profile permissions" });
    }
  });

  // Admin: Update a user's profile permissions
  router.patch(
    "/:id",
    authenticateUser,
    requireAdmin,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const { permission_name } = req.body;

        const { data, error } = await supabase
          .from("profile_permissions")
          .update({ permission_name, updated_at: new Date() })
          .eq("profile_id", id)
          .select();
        if (error || !data || data.length === 0) {
          return res
            .status(404)
            .json({ error: "Profile permissions not found" });
        }
        res.json(data[0]);
      } catch (error) {
        console.error("Failed to update profile permissions:", error.message);
        res.status(500).json({ error: "Failed to update profile permissions" });
      }
    }
  );

  // Admin: Request to delete a profile permission
  router.delete(
    "/:id",
    authenticateUser,
    requirePermission("can_manage_profiles"),
    requestPermission(
      "DELETE_PROFILE_PERMISSION",
      "profile_permissions",
      (req) => req.params.id,
      (req) => ({ profileId: req.params.id })
    ),
    async (req, res) => {
      try {
        const { id } = req.params;
        const { error } = await supabase
          .from("profile_permissions")
          .delete()
          .eq("profile_id", id);
        if (error) {
          return res
            .status(500)
            .json({ error: "Failed to delete profile permission" });
        }
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Failed to delete profile permission" });
      }
    }
  );

  // Get user permissions (updated for new permission system)
  router.get("/permissions", authenticateUser, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.error("[permissions] Missing req.user.id", req.user);
        return res.status(400).json({ error: "Missing user id in request" });
      }

      console.log("[permissions] Fetching permissions for user:", userId);

      // Get user permissions from user_permissions table
      let userPermissions = [];
      try {
        const { data: userPerms, error: userPermsError } = await supabase
          .from("user_permissions")
          .select("permission_name")
          .eq("user_id", userId);

        if (userPermsError) {
          console.warn("[permissions] user_permissions table error:", userPermsError.message);
        } else if (userPerms && userPerms.length > 0) {
          userPermissions = userPerms.map(row => row.permission_name);
          console.log("[permissions] Found user-specific permissions:", userPermissions);
        }
      } catch (error) {
        console.warn("[permissions] user_permissions table not accessible:", error.message);
      }

      // If no user-specific permissions, try to get role-based permissions
      if (userPermissions.length === 0) {
        try {
          // Get user's role from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

          if (profileError) {
            console.warn("[permissions] Could not fetch user role:", profileError.message);
          } else if (profileData && profileData.role) {
            console.log("[permissions] User role:", profileData.role);
            
            // Get role-based permissions
            const { data: rolePerms, error: rolePermsError } = await supabase
              .from("role_permissions")
              .select("permission_name")
              .eq("role", profileData.role.toUpperCase());

            if (rolePermsError) {
              console.warn("[permissions] role_permissions table not found:", rolePermsError.message);
            } else if (rolePerms && rolePerms.length > 0) {
              userPermissions = rolePerms.map(row => row.permission_name);
              console.log("[permissions] Found role-based permissions:", userPermissions);
            }
          }
        } catch (error) {
          console.warn("[permissions] Error fetching role-based permissions:", error.message);
        }
      }

      // If still no permissions, return empty array (fallback will be handled by frontend)
      if (userPermissions.length === 0) {
        console.warn(`[permissions] No permissions found for user ${userId}, returning empty array`);
        return res.json([]);
      }

      console.log("[permissions] Final permissions for user:", userPermissions);
      res.json(userPermissions);
    } catch (error) {
      console.error("[permissions] Unexpected error:", error);
      res.status(500).json({
        error: "Failed to fetch user permissions",
        details: error.message,
      });
    }
  });

  // Test route
  router.get("/test", (req, res) => {
    res.json({ message: "Test route is working" });
  });

  // Simple permissions test route (no database required)
  router.get("/permissions-test", authenticateUser, (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: "Missing user id" });
      }
      
      // Return a simple test response
      res.json({
        message: "Permissions endpoint is working",
        userId: userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Test failed", details: error.message });
    }
  });

  // Status endpoint to check API health
  router.get("/status", (req, res) => {
    res.json({
      message: "Profile API is working",
      timestamp: new Date().toISOString(),
      endpoints: {
        permissions: "/permissions",
        permissionsTest: "/permissions-test",
        status: "/status"
      }
    });
  });

  return router;
};

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

  // Get user permissions
  router.get("/permissions", authenticateUser, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.error("[permissions] Missing req.user.id", req.user);
        return res.status(400).json({ error: "Missing user id in request" });
      }

      const { data: profilePerms, error: permsError } = await supabase
        .from("profile_permissions")
        .select("permission_name")
        .eq("profile_id", userId);
      if (permsError) {
        console.error("[permissions] profile_permissions error:", permsError);
        return res.status(500).json({
          error: "Failed to fetch user permissions",
          details: permsError.message,
        });
      }

      if (!profilePerms || profilePerms.length === 0) {
        console.warn(
          `[permissions] No permissions assigned for profile ${userId}`
        );
        return res.json([]);
      }

      res.json(profilePerms.map((row) => row.permission_name));
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

  return router;
};

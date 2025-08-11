const supabase = require("../supabaseClient");

// Accepts permissionName and optional resourceType, matching frontend logic
const requirePermission = (permissionName, resourceType = null) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      // Supabase permission check
      let query = supabase.from("user_permissions").select("permission_name");
      query = query
        .eq("user_id", req.user.id)
        .eq("permission_name", permissionName);
      if (resourceType) {
        query = query.eq("resource_type", resourceType);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ error: "Permission check failed" });
      }
      if (data && data.length > 0) {
        return next();
      } else {
        console.log(
          "Permission denied for user:",
          req.user.id,
          "permission_name required:",
          permissionName
        );
        return res.status(403).json({
          error: `Permission denied: ${permissionName}${
            resourceType ? " on " + resourceType : ""
          } required`,
        });
      }
    } catch (error) {
      console.error("Permission check failed:", error);
      return res.status(500).json({ error: "Permission check failed" });
    }
  };
};

module.exports = requirePermission;

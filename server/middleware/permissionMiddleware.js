const supabase = require("../supabaseClient");

// Accepts permissionName and optional resourceType, matching frontend logic
const requirePermission = (permissionName, resourceType = null) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      // Check user permissions from user_permissions table
      let query = supabase.from("user_permissions").select("permission_name");
      query = query
        .eq("user_id", req.user.id)
        .eq("permission_name", permissionName);
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ error: "Permission check failed" });
      }
      
      if (data && data.length > 0) {
        return next();
      }
      
      // If no direct permission, check role-based permissions
      try {
        // Get user's role from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", req.user.id)
          .single();

        if (profileError) {
          console.warn("Could not fetch user role:", profileError.message);
        } else if (profileData && profileData.role) {
          // Get role-based permissions
          const { data: rolePerms, error: rolePermsError } = await supabase
            .from("role_permissions")
            .select("permission_name")
            .eq("role", profileData.role.toUpperCase())
            .eq("permission_name", permissionName);

          if (rolePermsError) {
            console.warn("role_permissions table error:", rolePermsError.message);
          } else if (rolePerms && rolePerms.length > 0) {
            return next(); // User has permission via role
          }
        }
      } catch (roleError) {
        console.warn("Role permission check failed:", roleError.message);
      }
      
      // No permission found
      console.log(
        "Permission denied for user:",
        req.user.id,
        "permission required:",
        permissionName
      );
      return res.status(403).json({
        error: `Permission denied: ${permissionName}${
          resourceType ? " on " + resourceType : ""
        } required`,
      });
    } catch (error) {
      console.error("Permission check failed:", error);
      return res.status(500).json({ error: "Permission check failed" });
    }
  };
};

module.exports = requirePermission;

const pool = require("../db");

const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      // First, get the user's role from the profiles table
      const { rows: profileRows } = await pool.query(
        "SELECT role FROM public.profiles WHERE id = $1",
        [req.user.id]
      );
      const userProfile = profileRows[0];

      if (!userProfile) {
        return res.status(403).json({ error: "Profile not found" });
      }

      // Admins and Super Admins bypass granular permissions
      if (userProfile.role === "SUPER_ADMIN" || userProfile.role === "ADMIN") {
        return next();
      }

      // Check if the user has the required permission
      const { rows: permissionRows } = await pool.query(
        `
        SELECT p.name
        FROM permissions p
        JOIN profile_permissions pp ON p.id = pp.permission_id
        WHERE pp.profile_id = $1 AND p.name = $2;
      `,
        [req.user.id, permissionName]
      );

      if (permissionRows.length > 0) {
        next();
      } else {
        res
          .status(403)
          .json({ error: `Permission denied: ${permissionName} required` });
      }
    } catch (error) {
      console.error("Permission check failed:", error);
      res.status(500).json({ error: "Permission check failed" });
    }
  };
};

module.exports = { requirePermission };

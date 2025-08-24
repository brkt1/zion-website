const express = require("express");
const {
  authenticateUser,
  requireAdmin,
} = require("../middleware/authMiddleware");
const { logAdminActivity } = require("../middleware/activityLogger");
const { requirePermission } = require("../middleware/permissionMiddleware");
const supabase = require("../supabaseClient");

const router = express.Router();

// Admin Routes
router.get("/users", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post(
  "/cafe-owners",
  authenticateUser,
  requireAdmin,
  logAdminActivity("CREATED_CAFE_OWNER", null, (req) => ({
    email: req.body.email,
  })),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // This is a placeholder for creating a user in your auth system.
      // You will need to replace this with your actual user creation logic.
      const newUser = { id: "new-user-id", email };

      // Create profile using Supabase
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: newUser.id,
          email: email,
          name: name,
          role: "CAFE_OWNER"
        })
        .select()
        .single();

      if (profileError) {
        return res.status(500).json({ error: "Failed to create profile" });
      }

      res.status(201).json({ user: profileData });
    } catch (error) {
      res.status(500).json({ error: "Failed to create cafe owner" });
    }
  }
);

router.get("/dashboard", authenticateUser, requireAdmin, async (req, res) => {
  console.log("[DEBUG] req.user in /dashboard:", req.user);
  try {
    // Get total users count
    const { count: totalUsers, error: countError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error counting users:", countError);
      return res.status(500).json({ error: "Failed to count users" });
    }

    // Get user roles
    const { data: userRoles, error: userRolesError } = await supabase
      .from("profiles")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: false });

    if (userRolesError) {
      console.error("Error fetching user roles:", userRolesError);
      return res.status(500).json({ error: "Failed to fetch user roles" });
    }

    // Get recent admin activities
    const { data: recentActivities, error: activitiesError } = await supabase
      .from("admin_activity_log")
      .select("admin_id, action, created_at, details")
      .order("created_at", { ascending: false })
      .limit(10);

    if (activitiesError) {
      console.warn("Could not fetch recent activities:", activitiesError.message);
    }

    // Get role distribution
    const roleDistribution = {};
    userRoles.forEach(user => {
      const role = user.role || "USER";
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });

    const dashboardData = {
      totalUsers: totalUsers || 0,
      activeSessions: 0, // This would need to be implemented based on your session management
      recentActivities: recentActivities || [],
      userRoles: userRoles.map((user) => ({
        userId: user.id,
        email: user.email || "",
        role: user.role || "USER",
        created_at: user.created_at
      })),
      roleDistribution: Object.entries(roleDistribution).map(([role, count]) => ({
        role,
        count
      })),
      systemHealth: "operational"
    };

    res.setHeader("Content-Type", "application/json");
    res.json(dashboardData);
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      error: "Failed to load admin dashboard",
      details: error.message,
    });
  }
});

// Log admin login activity
router.post("/log-login", authenticateUser, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", adminId)
      .single();

    if (profileError) {
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    const profile = profileData;

    if (
      profile &&
      (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN")
    ) {
      const { error: logError } = await supabase
        .from("admin_activity_log")
        .insert({
          admin_id: adminId,
          action: "ADMIN_LOGIN",
          details: { ipAddress: req.ip, userAgent: req.headers["user-agent"] }
        });

      if (logError) {
        console.error("Error logging admin login:", logError);
        return res.status(500).json({ error: "Failed to log login activity" });
      }

      res.status(200).json({ message: "Login activity logged" });
    } else {
      res.status(403).json({ error: "Not an admin" });
    }
  } catch (error) {
    console.error("Error logging admin login:", error);
    res.status(500).json({ error: "Failed to log login activity" });
  }
});

// Cafe Owner Dashboard Route
router.get("/cafe-owner/dashboard", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user's ID

    // Check if the user is a CAFE_OWNER
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profileData || profileData.role !== "CAFE_OWNER") {
      return res.status(403).json({ error: "Access denied. Not a Cafe Owner." });
    }

    // Fetch data for the Cafe Owner Dashboard
    // Assuming player_id in certificates table corresponds to the cafe owner's user_id
    const { count: totalCertificates, error: certCountError } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("player_id", userId);

    if (certCountError) {
      console.error("Error counting certificates:", certCountError);
      return res.status(500).json({ error: "Failed to count certificates" });
    }

    const { count: totalPrizesRedeemed, error: prizeCountError } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("player_id", userId)
      .eq("prize_delivered", true);

    if (prizeCountError) {
      console.error("Error counting prizes:", prizeCountError);
      return res.status(500).json({ error: "Failed to count prizes" });
    }

    const dashboardData = {
      totalCertificates: totalCertificates || 0,
      totalPrizesRedeemed: totalPrizesRedeemed || 0,
      // Add more cafe owner specific data here as needed
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Cafe Owner dashboard error:", error);
    res.status(500).json({
      error: "Failed to load Cafe Owner dashboard",
      details: error.message,
    });
  }
});

module.exports = router;

const express = require("express");
const pool = require("../db");
const {
  authenticateUser,
  requireAdmin,
} = require("../middleware/authMiddleware");
const { logAdminActivity } = require("../middleware/activityLogger");
const { requirePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

// Admin Routes
router.get("/users", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.*, p.role
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.id
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
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

      const { rows: userRows } = await pool.query(
        `
      INSERT INTO users (email, auth_user_id)
      VALUES ($1, $2)
      RETURNING *;
    `,
        [email, newUser.id]
      );

      const user = userRows[0];

      const { rows: profileRows } = await pool.query(
        `
      INSERT INTO profiles (user_id, role)
      VALUES ($1, $2)
      RETURNING *;
    `,
        [user.id, "CAFE_OWNER"]
      );

      const profile = profileRows[0];

      const { rows: cafeOwnerRows } = await pool.query(
        `
      INSERT INTO cafe_owners (name, email, user_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `,
        [name, email, user.id]
      );

      const cafeOwner = cafeOwnerRows[0];

      res.status(201).json({ user: { ...user, profile }, cafeOwner });
    } catch (error) {
      res.status(500).json({ error: "Failed to create cafe owner" });
    }
  }
);

router.get("/dashboard", authenticateUser, requireAdmin, async (req, res) => {
  console.log("[DEBUG] req.user in /dashboard:", req.user);
  try {
    const totalUsersResult = await pool.query(
      "SELECT COUNT(*) AS total FROM public.profiles"
    );
    const totalUsers = Number(totalUsersResult.rows[0].total);

    const { rows: userRoles } = await pool.query(
      `
      SELECT p.id AS userId, u.email, p.role
      FROM public.profiles p
      LEFT JOIN auth.users u ON p.id = u.id
    `
    );

    const dashboardData = {
      totalUsers,
      activeSessions: 0,
      recentActivities: [],
      userRoles: userRoles.map((user) => ({
        userId: user.userId,
        email: user.email || "",
        role: user.role || "USER",
      })),
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
    const { rows } = await pool.query(
      "SELECT role FROM profiles WHERE id = $1",
      [adminId]
    );
    const profile = rows[0];

    if (
      profile &&
      (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN")
    ) {
      await pool.query(
        "INSERT INTO admin_activity_log (admin_id, action, details) VALUES ($1, $2, $3)",
        [
          adminId,
          "ADMIN_LOGIN",
          { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
        ]
      );
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
    const { rows: profileRows } = await pool.query(
      "SELECT role FROM public.profiles WHERE id = $1",
      [userId]
    );

    if (!profileRows || profileRows.length === 0 || profileRows[0].role !== "CAFE_OWNER") {
      return res.status(403).json({ error: "Access denied. Not a Cafe Owner." });
    }

    // Fetch data for the Cafe Owner Dashboard
    // Assuming player_id in certificates table corresponds to the cafe owner's user_id
    const totalCertificatesResult = await pool.query(
      "SELECT COUNT(*) AS total FROM public.certificates WHERE player_id = $1",
      [userId]
    );
    const totalCertificates = Number(totalCertificatesResult.rows[0].total);

    const totalPrizesRedeemedResult = await pool.query(
      "SELECT COUNT(*) AS total FROM public.certificates WHERE player_id = $1 AND prize_delivered = TRUE",
      [userId]
    );
    const totalPrizesRedeemed = Number(totalPrizesRedeemedResult.rows[0].total);

    const dashboardData = {
      totalCertificates,
      totalPrizesRedeemed,
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

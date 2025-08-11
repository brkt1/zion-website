const express = require("express");
const supabase = require("../supabaseClient");
const {
  authenticateUser,
  requireAdmin,
} = require("../middleware/authMiddleware");
const {
  logAdminActivity,
  requestPermission,
} = require("../middleware/activityLogger");
const requirePermission = require("../middleware/permissionMiddleware");

const router = express.Router();

// Game Types
router.get("/", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("game_types").select("*");
    if (error) {
      return res.status(500).json({ error: "Failed to fetch game types" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game types" });
  }
});

router.post(
  "/",
  authenticateUser,
  requireAdmin,
  logAdminActivity("CREATED_GAME_TYPE", null, (req) => ({
    name: req.body.name,
  })),
  async (req, res) => {
    try {
      const { name } = req.body;
      const { data, error } = await supabase
        .from("game_types")
        .insert({ name })
        .select();
      if (error || !data || data.length === 0) {
        return res.status(500).json({ error: "Failed to create game type" });
      }
      res.status(201).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create game type" });
    }
  }
);

router.delete(
  "/:id",
  authenticateUser,
  requirePermission("can_manage_game_types"),
  requestPermission(
    "DELETE_GAME_TYPE",
    "game_types",
    (req) => req.params.id,
    (req) => ({ gameTypeId: req.params.id })
  ),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from("game_types").delete().eq("id", id);
      if (error) {
        return res.status(500).json({ error: "Failed to delete game type" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete game type" });
    }
  }
);

module.exports = router;

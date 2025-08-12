const express = require("express");
const supabase = require("../supabaseClient");
const {
  authenticateUser,
  requireAdmin,
} = require("../middleware/authMiddleware");
const { logAdminActivity } = require("../middleware/activityLogger");
const requirePermission = require("../middleware/permissionMiddleware");

const router = express.Router();

// GET paginated & filtered enhanced cards
router.get("/", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { page = 1, selectedGameType, selectedTeam, selectedRarity } = req.query;
    const ITEMS_PER_PAGE = 10;
    let query = supabase
      .from("enhanced_cards_with_profile")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
    if (selectedGameType) query = query.eq("game_type_id", selectedGameType);
    if (selectedTeam) query = query.eq("player_team", selectedTeam);
    if (selectedRarity) query = query.eq("card_rarity", selectedRarity);
    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ data, count });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch cards" });
  }
});

// GET single enhanced card by id
router.get("/:id", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("enhanced_cards_with_profile")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch card" });
  }
});

// PATCH update enhanced card
router.patch(
  "/:id",
  authenticateUser,
  requireAdmin,
  requirePermission("can_manage_cards"),
  logAdminActivity("UPDATED_ENHANCED_CARD", (req) => req.params.id),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const { data, error } = await supabase
        .from("enhanced_cards")
        .update(updates)
        .eq("id", id)
        .select();
      if (error || !data || data.length === 0) {
        return res.status(500).json({ error: "Failed to update card" });
      }
      res.json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to update card" });
    }
  }
);



// POST create enhanced card
router.post(
  "/",
  authenticateUser,
  requireAdmin,
  logAdminActivity("CREATED_ENHANCED_CARD", null, (req) => ({
    card_number: req.body.card_number,
  })),
  async (req, res) => {
    try {
      const { card_number, duration, game_type_id, route_access, used, player_id } = req.body;
      const { data, error } = await supabase
        .from("enhanced_cards")
        .insert([{ card_number, duration, game_type_id, route_access, used, player_id, created_by: req.user.id }])
        .select();
      if (error || !data || data.length === 0) {
        return res.status(500).json({ error: "Failed to create card" });
      }
      res.status(201).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to create card" });
    }
  }
);

// DELETE single enhanced card
router.delete(
  "/:id",
  authenticateUser,
  requireAdmin,
  requirePermission("can_manage_cards"),
  logAdminActivity("DELETED_ENHANCED_CARD", (req) => req.params.id),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from("enhanced_cards")
        .delete()
        .eq("id", id);
      if (error) {
        return res.status(500).json({ error: "Failed to delete card" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to delete card" });
    }
  }
);

// DELETE batch enhanced cards
router.delete(
  "/batch",
  authenticateUser,
  requireAdmin,
  requirePermission("can_manage_cards"),
  async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No card IDs provided" });
      }
      const { error } = await supabase
        .from("enhanced_cards")
        .delete()
        .in("id", ids);
      if (error) {
        return res.status(500).json({ error: "Failed to batch delete cards" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message || "Batch delete failed" });
    }
  }
);

module.exports = router;

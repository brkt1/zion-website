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

// Certificates
router.get("/", authenticateUser, requireAdmin, async (req, res) => {
  try {
    // Fetch certificates
    const { data: certData, error: certError } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });
    if (certError) {
      return res.status(500).json({ error: "Failed to fetch certificates" });
    }
    // Fetch game type names for each certificate
    const gameTypeIds = certData.map((c) => c.game_type_id);
    const { data: gameTypes, error: gameTypeError } = await supabase
      .from("game_types")
      .select("id, name")
      .in("id", gameTypeIds);
    if (gameTypeError) {
      return res.status(500).json({ error: "Failed to fetch game types" });
    }
    // Attach game_type_name to each certificate
    const gameTypeMap = Object.fromEntries(
      gameTypes.map((gt) => [gt.id, gt.name])
    );
    const result = certData.map((c) => ({
      ...c,
      game_type_name: gameTypeMap[c.game_type_id] || null,
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

router.post(
  "/",
  authenticateUser,
  requireAdmin,
  logAdminActivity("CREATED_CERTIFICATE", null, (req) => ({
    playerId: req.body.playerId,
    gameTypeId: req.body.gameTypeId,
  })),
  async (req, res) => {
    try {
      const {
        playerName,
        playerId,
        score,
        gameTypeId,
        sessionId,
        hasWonCoffee = false,
        hasWonPrize = false,
        rewardType = null,
      } = req.body;

      const { data, error } = await supabase
        .from("certificates")
        .insert({
          player_name: playerName,
          player_id: playerId,
          score,
          game_type_id: gameTypeId,
          session_id: sessionId,
          has_won_coffee: hasWonCoffee,
          has_won_prize: hasWonPrize,
          reward_type: rewardType,
          timestamp: new Date(),
        })
        .select();
      if (error || !data || data.length === 0) {
        return res.status(500).json({ error: "Failed to create certificate" });
      }
      const newCertificate = data[0];
      // Fetch the game_type_name for the response
      const { data: gameTypeData, error: gameTypeError } = await supabase
        .from("game_types")
        .select("name")
        .eq("id", newCertificate.game_type_id);
      newCertificate.game_type_name =
        gameTypeData && gameTypeData[0] ? gameTypeData[0].name : null;
      res.status(201).json(newCertificate);
    } catch (error) {
      res.status(500).json({ error: "Failed to create certificate" });
    }
  }
);

router.delete(
  "/:id",
  authenticateUser,
  requirePermission("can_manage_certificates"),
  requestPermission(
    "DELETE_CERTIFICATE",
    "certificates",
    (req) => req.params.id,
    (req) => ({ certificateId: req.params.id })
  ),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("id", id);
      if (error) {
        return res.status(500).json({ error: "Failed to delete certificate" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete certificate" });
    }
  }
);

module.exports = router;

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

// Scores
router.post(
  "/",
  authenticateUser,
  requireAdmin,
  logAdminActivity("CREATED_SCORE", null, (req) => ({
    playerId: req.body.playerId,
    gameTypeId: req.body.gameTypeId,
    score: req.body.score,
  })),
  async (req, res) => {
    try {
      const {
        playerName,
        playerId,
        score,
        stage,
        sessionId,
        streak,
        gameTypeId,
      } = req.body;

      const { data, error } = await supabase
        .from("scores")
        .insert({
          player_name: playerName,
          player_id: playerId,
          score,
          stage,
          session_id: sessionId,
          streak,
          game_type_id: gameTypeId,
          timestamp: new Date(),
        })
        .select();
      if (error || !data || data.length === 0) {
        return res.status(500).json({ error: "Failed to create score" });
      }
      const newScore = data[0];
      // Fetch the game_type_name for the response
      const { data: gameTypeData, error: gameTypeError } = await supabase
        .from("game_types")
        .select("name")
        .eq("id", newScore.game_type_id);
      newScore.game_type_name =
        gameTypeData && gameTypeData[0] ? gameTypeData[0].name : null;
      res.status(201).json(newScore);
    } catch (error) {
      res.status(500).json({ error: "Failed to create score" });
    }
  }
);

router.get("/", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .order("timestamp", { ascending: false });
    if (error) {
      return res.status(500).json({ error: "Failed to fetch scores" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

router.delete(
  "/:id",
  authenticateUser,
  requirePermission("can_manage_scores"),
  requestPermission(
    "DELETE_SCORE",
    "scores",
    (req) => req.params.id,
    (req) => ({ scoreId: req.params.id })
  ),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from("scores").delete().eq("id", id);
      if (error) {
        return res.status(500).json({ error: "Failed to delete score" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete score" });
    }
  }
);

// Get game result by session and player ID (accessible by anyone)
router.get("/result", async (req, res) => {
  try {
    const { sessionId, playerId } = req.query;

    if (!sessionId || !playerId) {
      return res
        .status(400)
        .json({ error: "Session ID and Player ID are required." });
    }

    // Fetch scores for session and player
    const { data: scoresData, error: scoresError } = await supabase
      .from("scores")
      .select("*")
      .eq("session_id", sessionId)
      .eq("player_id", playerId)
      .order("timestamp", { ascending: false })
      .limit(1);
    if (scoresError || !scoresData || scoresData.length === 0) {
      return res.status(404).json({ error: "Game result not found." });
    }
    const scoreResult = scoresData[0];
    // Fetch game type name
    const { data: gameTypeData, error: gameTypeError } = await supabase
      .from("game_types")
      .select("name")
      .eq("id", scoreResult.game_type_id);
    scoreResult.game_type =
      gameTypeData && gameTypeData[0] ? gameTypeData[0].name : null;
    res.json(scoreResult);
  } catch (error) {
    console.error("Failed to fetch game result:", error);
    res.status(500).json({ error: "Failed to fetch game result" });
  }
});

module.exports = router;

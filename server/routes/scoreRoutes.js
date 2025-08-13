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

// Simple test endpoint
router.get("/test", (req, res) => {
  res.json({ 
    message: "Score routes are working!",
    timestamp: new Date().toISOString(),
    query: req.query
  });
});

// Debug endpoint to check database schema
router.get("/debug/schema", async (req, res) => {
  try {
    console.log("Debug: Checking database schema...");
    
    // Check if scores table exists and get its structure
    const { data: scoresData, error: scoresError } = await supabase
      .from("scores")
      .select("*")
      .limit(1);
    
    console.log("Scores table check:");
    console.log("  data:", scoresData);
    console.log("  error:", scoresError);
    
    // Check if game_types table exists
    const { data: gameTypesData, error: gameTypesError } = await supabase
      .from("game_types")
      .select("*")
      .limit(1);
    
    console.log("Game types table check:");
    console.log("  data:", gameTypesData);
    console.log("  error:", gameTypesError);
    
    res.json({
      scores: {
        exists: !scoresError,
        error: scoresError?.message,
        sampleData: scoresData?.[0] || null,
        columns: scoresData?.[0] ? Object.keys(scoresData[0]) : []
      },
      gameTypes: {
        exists: !gameTypesError,
        error: gameTypesError?.message,
        sampleData: gameTypesData?.[0] || null,
        columns: gameTypesData?.[0] ? Object.keys(gameTypesData[0]) : []
      }
    });
  } catch (error) {
    console.error("Schema debug error:", error);
    res.status(500).json({ 
      error: "Schema debug failed",
      details: error.message 
    });
  }
});

// Get game result by session and player ID (accessible by anyone)
router.get("/result", async (req, res) => {
  try {
    const { sessionId, playerId } = req.query;
    console.log("Received request for game result:");
    console.log("  sessionId:", sessionId);
    console.log("  playerId:", playerId);

    if (!sessionId || !playerId) {
      return res
        .status(400)
        .json({ error: "Session ID and Player ID are required." });
    }

    // First, let's check if the scores table exists and has the right structure
    console.log("Checking scores table structure...");
    const { data: tableInfo, error: tableError } = await supabase
      .from("scores")
      .select("*")
      .limit(1);
    
    console.log("Table structure check:");
    console.log("  tableInfo:", tableInfo);
    console.log("  tableError:", tableError);

    if (tableError) {
      console.error("Table structure error:", tableError);
      return res.status(500).json({ 
        error: "Database table error", 
        details: tableError.message 
      });
    }

    // First try to fetch from emoji_scores table
    console.log("Querying emoji_scores table...");
    let { data: scoresData, error: scoresError } = await supabase
      .from("emoji_scores")
      .select("*")
      .eq("session_id", sessionId)
      .eq("player_id", playerId)
      .order("timestamp", { ascending: false })
      .limit(1);

    // If not found in emoji_scores, try the regular scores table
    if (!scoresData || scoresData.length === 0) {
      console.log("Not found in emoji_scores, trying scores table...");
      const { data: regularScoresData, error: regularScoresError } = await supabase
        .from("scores")
        .select("*")
        .eq("session_id", sessionId)
        .eq("player_id", playerId)
        .order("timestamp", { ascending: false })
        .limit(1);
      
      if (regularScoresError) {
        console.error("Regular scores query error:", regularScoresError);
        return res.status(500).json({ 
          error: "Database query error", 
          details: regularScoresError.message 
        });
      }
      
      scoresData = regularScoresData;
      scoresError = regularScoresError;
    }

    console.log("Supabase query result:");
    console.log("  scoresData:", scoresData);
    console.log("  scoresError:", scoresError);

    if (scoresError) {
      console.error("Scores query error:", scoresError);
      return res.status(500).json({ 
        error: "Database query error", 
        details: scoresError.message 
      });
    }

    if (!scoresData || scoresData.length === 0) {
      console.log("No scores found for session:", sessionId, "player:", playerId);
      return res.status(404).json({ 
        error: "Game result not found.",
        message: "No scores found for the given session and player ID"
      });
    }

    const scoreResult = scoresData[0];
    console.log("Found score result:", scoreResult);

    // Fetch game type name if game_type_id exists
    if (scoreResult.game_type_id) {
      const { data: gameTypeData, error: gameTypeError } = await supabase
        .from("game_types")
        .select("name")
        .eq("id", scoreResult.game_type_id);
      
      if (gameTypeError) {
        console.warn("Failed to fetch game type:", gameTypeError);
      } else {
        scoreResult.game_type =
          gameTypeData && gameTypeData[0] ? gameTypeData[0].name : null;
      }
    }

    console.log("Returning final result:", scoreResult);
    res.json(scoreResult);
  } catch (error) {
    console.error("Failed to fetch game result:", error);
    res.status(500).json({ 
      error: "Failed to fetch game result",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

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

module.exports = router;

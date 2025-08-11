const express = require("express");
const supabase = require("../supabaseClient");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/leaderboard/global
// Aggregates scores from both 'scores' and 'emoji_scores', sums per user, returns top 10
router.get("/global", authenticateUser, async (req, res) => {
  try {
    // Fetch scores and emoji_scores from Supabase
    const { data: scores, error: scoresError } = await supabase
      .from("scores")
      .select("player_id, player_name, score");
    const { data: emojiScores, error: emojiScoresError } = await supabase
      .from("emoji_scores")
      .select("player_id, player_name, score");

    if (scoresError) {
      console.error("Error fetching scores:", scoresError.message);
    }
    if (emojiScoresError) {
      console.error("Error fetching emoji_scores:", emojiScoresError.message);
    }

    const safeScores = scores || [];
    const safeEmojiScores = emojiScores || [];

    // Aggregate scores
    const combined = [...safeScores, ...safeEmojiScores];
    const scoreMap = {};
    combined.forEach(({ player_id, player_name, score }) => {
      if (!scoreMap[player_id]) {
        scoreMap[player_id] = { playerName: player_name, totalScore: 0 };
      }
      scoreMap[player_id].totalScore += score;
    });
    // Sort and get top 10
    const leaderboard = Object.entries(scoreMap)
      .map(([playerId, { playerName, totalScore }]) => ({
        playerId,
        playerName,
        totalScore,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10)
      .map((row, idx) => ({ ...row, rank: idx + 1 }));
    res.json(leaderboard);
  } catch (error) {
    console.error("Failed to fetch global leaderboard:", error);
    // Return an empty leaderboard instead of a 500 error
    res.json([]);
  }
});

// POST /api/leaderboard/bonus
// Grants a 10-point bonus to top 3 users, only once per session per user
router.post("/bonus", authenticateUser, async (req, res) => {
  try {
    const { playerId, sessionId, gameType } = req.body;
    if (!playerId || !sessionId) {
      return res
        .status(400)
        .json({ error: "playerId and sessionId are required." });
    }

    // Fetch scores and emoji_scores from Supabase
    const { data: scores, error: scoresError } = await supabase
      .from("scores")
      .select("player_id, score");
    const { data: emojiScores, error: emojiScoresError } = await supabase
      .from("emoji_scores")
      .select("player_id, score");
    if (scoresError || emojiScoresError) {
      return res.status(500).json({ error: "Failed to fetch scores" });
    }
    // Aggregate scores
    const combined = [...scores, ...emojiScores];
    const scoreMap = {};
    combined.forEach(({ player_id, score }) => {
      if (!scoreMap[player_id]) {
        scoreMap[player_id] = 0;
      }
      scoreMap[player_id] += score;
    });
    // Sort and get top 3
    const top3 = Object.entries(scoreMap)
      .map(([playerId, totalScore]) => ({ playerId, totalScore }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 3);
    const isTop3 = top3.some((row) => row.playerId === playerId);
    if (!isTop3) {
      return res.status(403).json({ error: "User is not in the top 3." });
    }
    // Check if bonus already granted for this session
    const { data: bonusData, error: bonusError } = await supabase
      .from("leaderboard_bonus")
      .select("id")
      .eq("player_id", playerId)
      .eq("session_id", sessionId)
      .eq("game_type", gameType || null);
    if (bonusError) {
      return res.status(500).json({ error: "Failed to check bonus" });
    }
    if (bonusData && bonusData.length > 0) {
      return res
        .status(409)
        .json({ error: "Bonus already granted for this session." });
    }
    // Grant bonus: add 10 points to the correct table
    let updateResult;
    if (gameType === "emoji") {
      updateResult = await supabase
        .from("emoji_scores")
        .update({ score: supabase.rpc("increment_score", { inc: 10 }) })
        .eq("player_id", playerId)
        .eq("session_id", sessionId)
        .select();
    } else {
      updateResult = await supabase
        .from("scores")
        .update({ score: supabase.rpc("increment_score", { inc: 10 }) })
        .eq("player_id", playerId)
        .eq("session_id", sessionId)
        .select();
    }
    if (!updateResult.data || updateResult.data.length === 0) {
      return res
        .status(404)
        .json({ error: "Score entry not found for bonus." });
    }
    // Record the bonus grant
    const { error: recordError } = await supabase
      .from("leaderboard_bonus")
      .insert({
        player_id: playerId,
        session_id: sessionId,
        game_type: gameType || null,
      });
    if (recordError) {
      return res.status(500).json({ error: "Failed to record bonus grant" });
    }
    res.json({ message: "Bonus granted!", bonus: 10 });
  } catch (error) {
    console.error("Failed to grant leaderboard bonus:", error);
    res.status(500).json({ error: "Failed to grant leaderboard bonus" });
  }
});

module.exports = router;

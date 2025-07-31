const express = require('express');
const pool = require('../db');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/leaderboard/global
// Aggregates scores from both 'scores' and 'emoji_scores', sums per user, returns top 10
router.get('/global', authenticateUser, async (req, res) => {
  try {
    // Aggregate scores from both tables by player_id and player_name
    const query = `
      SELECT player_id, player_name, SUM(total_score) AS total_score FROM (
        SELECT player_id, player_name, SUM(score) AS total_score FROM scores GROUP BY player_id, player_name
        UNION ALL
        SELECT player_id, player_name, SUM(score) AS total_score FROM emoji_scores GROUP BY player_id, player_name
      ) AS combined
      GROUP BY player_id, player_name
      ORDER BY total_score DESC
      LIMIT 10;
    `;
    const { rows } = await pool.query(query);

    // Add rank
    const leaderboard = rows.map((row, idx) => ({
      rank: idx + 1,
      playerId: row.player_id,
      playerName: row.player_name,
      totalScore: parseInt(row.total_score, 10)
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Failed to fetch global leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch global leaderboard' });
  }
});

// POST /api/leaderboard/bonus
// Grants a 10-point bonus to top 3 users, only once per session per user
router.post('/bonus', authenticateUser, async (req, res) => {
  try {
    const { playerId, sessionId, gameType } = req.body;
    if (!playerId || !sessionId) {
      return res.status(400).json({ error: 'playerId and sessionId are required.' });
    }

    // Check if user is in top 3
    const leaderboardQuery = `
      SELECT player_id, SUM(total_score) AS total_score FROM (
        SELECT player_id, SUM(score) AS total_score FROM scores GROUP BY player_id
        UNION ALL
        SELECT player_id, SUM(score) AS total_score FROM emoji_scores GROUP BY player_id
      ) AS combined
      GROUP BY player_id
      ORDER BY total_score DESC
      LIMIT 3;
    `;
    const { rows: topRows } = await pool.query(leaderboardQuery);
    const isTop3 = topRows.some(row => row.player_id === playerId);
    if (!isTop3) {
      return res.status(403).json({ error: 'User is not in the top 3.' });
    }

    // Check if bonus already granted for this session
    const bonusCheck = await pool.query(
      'SELECT 1 FROM leaderboard_bonus WHERE player_id = $1 AND session_id = $2 AND (game_type = $3 OR $3 IS NULL)',
      [playerId, sessionId, gameType || null]
    );
    if (bonusCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Bonus already granted for this session.' });
    }

    // Grant bonus: add 10 points to the correct table
    let updateResult;
    if (gameType === 'emoji') {
      updateResult = await pool.query(
        'UPDATE emoji_scores SET score = score + 10 WHERE player_id = $1 AND session_id = $2 RETURNING *',
        [playerId, sessionId]
      );
    } else {
      updateResult = await pool.query(
        'UPDATE scores SET score = score + 10 WHERE player_id = $1 AND session_id = $2 RETURNING *',
        [playerId, sessionId]
      );
    }
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Score entry not found for bonus.' });
    }

    // Record the bonus grant
    await pool.query(
      'INSERT INTO leaderboard_bonus (player_id, session_id, game_type) VALUES ($1, $2, $3)',
      [playerId, sessionId, gameType || null]
    );

    res.json({ message: 'Bonus granted!', bonus: 10 });
  } catch (error) {
    console.error('Failed to grant leaderboard bonus:', error);
    res.status(500).json({ error: 'Failed to grant leaderboard bonus' });
  }
});

module.exports = router;

const express = require("express");
const pool = require("../db");
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

// Questions
router.get("/:gameTypeId", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { gameTypeId } = req.params;
    const { difficulty, limit = 10 } = req.query;

    let query = "SELECT * FROM questions WHERE game_type_id = $1";
    const params = [gameTypeId];

    if (difficulty) {
      query += " AND difficulty = $2";
      params.push(parseInt(difficulty));
    }

    query += ` LIMIT ${parseInt(limit)}`;

    const { rows } = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

router.post(
  "/",
  authenticateUser,
  requireAdmin,
  logAdminActivity("CREATED_QUESTION", null, (req) => ({
    gameTypeId: req.body.gameTypeId,
    questionText: req.body.questionText,
  })),
  async (req, res) => {
    try {
      const { gameTypeId, questionText, options, correctAnswer, difficulty } =
        req.body;
      const { rows } = await pool.query(
        "INSERT INTO questions (game_type_id, question_text, options, correct_answer, difficulty) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
        [gameTypeId, questionText, options, correctAnswer, difficulty]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create question" });
    }
  }
);

router.put(
  "/:id",
  authenticateUser,
  requireAdmin,
  logAdminActivity(
    "UPDATED_QUESTION",
    (req) => req.params.id,
    (req) => ({
      gameTypeId: req.body.gameTypeId,
      questionText: req.body.questionText,
    })
  ),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { gameTypeId, questionText, options, correctAnswer, difficulty } =
        req.body;
      const { rows } = await pool.query(
        "UPDATE questions SET game_type_id = $1, question_text = $2, options = $3, correct_answer = $4, difficulty = $5 WHERE id = $6 RETURNING *;",
        [gameTypeId, questionText, options, correctAnswer, difficulty, id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update question" });
    }
  }
);

router.delete(
  "/:id",
  authenticateUser,
  requirePermission("can_manage_questions"),
  requestPermission(
    "DELETE_QUESTION",
    "questions",
    (req) => req.params.id,
    (req) => ({ questionId: req.params.id })
  ),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { rowCount } = await pool.query(
        "DELETE FROM questions WHERE id = $1;",
        [id]
      );
      if (rowCount === 0) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete question" });
    }
  }
);

module.exports = router;

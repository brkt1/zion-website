const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  requireAdmin,
} = require("../middleware/authMiddleware");
const {
  logAdminActivity,
  requestPermission,
} = require("../middleware/activityLogger");
const requirePermission = require("../middleware/permissionMiddleware");

const supabase = require("../supabaseClient");
module.exports = function () {
  // Get all unused cards
  router.get("/", authenticateUser, requireAdmin, async (req, res) => {
    try {
      // Fetch unused cards
      const { data: cards, error: cardsError } = await supabase
        .from("cards")
        .select("*, game_types(name)")
        .eq("used", false)
        .order("created_at", { ascending: false });
      if (cardsError) {
        return res.status(500).json({ error: "Failed to fetch cards" });
      }
      // Attach game_type_name
      const result = cards.map((card) => ({
        ...card,
        game_type_name: card.game_types ? card.game_types.name : null,
      }));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });

  // Create a new card
  router.post(
    "/",
    authenticateUser,
    requirePermission("can_manage_cards"),
    logAdminActivity("CREATED_CARD", null, (req) => ({
      cardNumber: req.body.cardNumber,
      gameTypeId: req.body.gameTypeId,
    })),
    async (req, res) => {
      try {
        const { content, duration, gameTypeId, cardNumber } = req.body;
        const { data, error } = await supabase
          .from("cards")
          .insert({
            content,
            duration,
            game_type_id: gameTypeId,
            card_number: cardNumber,
          })
          .select();
        if (error || !data || data.length === 0) {
          return res.status(500).json({ error: "Failed to create card" });
        }
        const newCard = data[0];
        // Fetch the game_type_name for the response
        const { data: gameTypeData, error: gameTypeError } = await supabase
          .from("game_types")
          .select("name")
          .eq("id", newCard.game_type_id);
        newCard.game_type_name =
          gameTypeData && gameTypeData[0] ? gameTypeData[0].name : null;
        res.status(201).json(newCard);
      } catch (error) {
        res.status(500).json({ error: "Failed to create card" });
      }
    }
  );

  // Mark a card as used
  router.patch(
    "/:id/use",
    authenticateUser,
    requireAdmin,
    logAdminActivity("USED_CARD", (req) => req.params.id),
    async (req, res) => {
      try {
        const { id } = req.params;
        const { data, error } = await supabase
          .from("cards")
          .update({ used: true })
          .eq("id", id)
          .select();
        if (error || !data || data.length === 0) {
          return res.status(500).json({ error: "Failed to mark card as used" });
        }
        const updatedCard = data[0];
        // Fetch the game_type_name for the response
        const { data: gameTypeData, error: gameTypeError } = await supabase
          .from("game_types")
          .select("name")
          .eq("id", updatedCard.game_type_id);
        updatedCard.game_type_name =
          gameTypeData && gameTypeData[0] ? gameTypeData[0].name : null;
        res.json(updatedCard);
      } catch (error) {
        res.status(500).json({ error: "Failed to mark card as used" });
      }
    }
  );

  // Request to delete a card
  router.delete(
    "/:id",
    authenticateUser,
    requirePermission("can_manage_cards"),
    requestPermission(
      "DELETE_CARD",
      "cards",
      (req) => req.params.id,
      (req) => ({ cardId: req.params.id })
    ),
    async (req, res) => {
      // This block will only be reached if the requestPermission middleware calls next()
      // Which means the super admin has approved the request.
      try {
        const { id } = req.params;
        const { error } = await supabase.from("cards").delete().eq("id", id);
        if (error) {
          return res.status(500).json({ error: "Failed to delete card" });
        }
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Failed to delete card" });
      }
    }
  );

  return router;
};

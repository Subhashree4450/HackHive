const express = require("express");
const router = express.Router();
const {
  addParticipant,
  moveParticipant,
  removeParticipant,
  getParticipants
} = require("../controllers/teamParticipantController");

router.post("/", addParticipant);       // Add participant to a team
router.put("/", moveParticipant);          // Move participant to another team
router.delete("/", removeParticipant);   // Remove participant from a team
router.get("/:teamId", getParticipants);         // Get all participants in a team

module.exports = router;

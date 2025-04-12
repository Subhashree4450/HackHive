const express = require('express');
const router = express.Router();

const {
  createParticipant,
  getParticipants,
  updateParticipant,
  deleteParticipant,
} = require('../controllers/participantController');

router.post('/', createParticipant); // ➡️ Create a new participant
router.get('/', getParticipants); // ➡️ Get all participants
router.put('/:id', updateParticipant); // ➡️ Update a participant
router.delete('/:id', deleteParticipant); // ➡️ Delete a participant

module.exports = router;



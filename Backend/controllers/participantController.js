const Participant = require('../models/particpants');

// @desc Create a new participant
// @route POST /api/participants
const createParticipant = async (req, res) => {
  try {
    const { id, name, email, skills, experience } = req.body;

    // Check if participant already exists
    const existingParticipant = await Participant.findOne({ email });
    if (existingParticipant) {
      return res.status(400).json({ message: 'Participant already exists' });
    }

    const participant = new Participant({ id, name, email, skills, experience });
    await participant.save();

    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all participants
// @route GET /api/participants
const getParticipants = async (req, res) => {
  try {
    const participants = await Participant.find();
    res.status(200).json(participants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a participant
// @route PUT /api/participants/:id
const updateParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, skills, experience } = req.body;

    const updatedParticipant = await Participant.findOneAndUpdate(
      { id },
      { name, email, skills, experience },
      { new: true }
    );

    if (!updatedParticipant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.status(200).json(updatedParticipant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a participant
// @route DELETE /api/participants/:id
const deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedParticipant = await Participant.findOneAndDelete({ id });

    if (!deletedParticipant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.status(200).json({ message: 'Participant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createParticipant,
  getParticipants,
  updateParticipant,
  deleteParticipant,
};




const {
    addParticipantToTeam,
    moveParticipantToTeam,
    removeParticipantFromTeam,
    getTeamParticipants
  } = require('../models/teamParticipantRel');
  
  // Add a participant to a team
  const addParticipant = async (req, res) => {
    const { participantId, teamId } = req.body;
    if (!participantId || !teamId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    try {
      await addParticipantToTeam(participantId, teamId);
      res.json({ message: `Participant ${participantId} added to team ${teamId}` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Move a participant to another team
  const moveParticipant = async (req, res) => {
    const { participantId, newTeamId } = req.body;
    if (!participantId || !newTeamId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    try {
      await moveParticipantToTeam(participantId, newTeamId);
      res.json({ message: `Participant ${participantId} moved to team ${newTeamId}` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Remove a participant from a team
  const removeParticipant = async (req, res) => {
    const { participantId, teamId } = req.body;
    if (!participantId || !teamId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    try {
      await removeParticipantFromTeam(participantId, teamId);
      res.json({ message: `Participant ${participantId} removed from team ${teamId}` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Get all participants in a team
  const getParticipants = async (req, res) => {
    const { teamId } = req.params;
    if (!teamId) {
      return res.status(400).json({ message: "Missing teamId" });
    }
    try {
      const participants = await getTeamParticipants(teamId);
      res.json({ teamId, participants });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports = {
    addParticipant,
    moveParticipant,
    removeParticipant,
    getParticipants
  };
  
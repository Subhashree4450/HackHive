const { createTeam, getTeams, updateTeam, deleteTeam } = require('../models/teams');

const createTeamController = async (req, res) => {
  const { teamId, teamName, projectId, teamSize } = req.body;

  try {
    const response = await createTeam({ teamId, teamName, projectId, teamSize });
    res.status(201).json({ message: "Team created successfully", ...response });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getTeamsController = async (req, res) => {
  try {
    const teams = await getTeams();
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTeamController = async (req, res) => {
  const { teamId } = req.params;
  const { teamName, projectId, teamSize } = req.body;

  try {
    const updatedTeam = await updateTeam(teamId, { teamName, projectId, teamSize });
    res.status(200).json({ message: "Team updated successfully", ...updatedTeam });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteTeamController = async (req, res) => {
  const { teamId } = req.params;

  try {
    const deletedTeam = await deleteTeam(teamId);
    res.status(200).json(deletedTeam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createTeamController,
  getTeamsController,
  updateTeamController,
  deleteTeamController
};




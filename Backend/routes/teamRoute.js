// const express = require('express');
// const {
//   createTeamController,
//   getTeamsController,
//   updateTeamController,
//   deleteTeamController
// } = require('../controllers/teamController');

// const router = express.Router();

// // Create Team
// router.post('/', createTeamController);

// // Get All Teams
// router.get('/', getTeamsController);

// // Update Team
// router.put('/:teamId', updateTeamController);

// // Delete Team
// router.delete('/:teamId', deleteTeamController);

// module.exports = router;


const express = require('express');
const {
  createTeamController,
  getTeamsController,
  updateTeamController,
  deleteTeamController
} = require('../controllers/teamController');

const router = express.Router();

router.post('/', createTeamController);
router.get('/', getTeamsController);
router.put('/:teamId', updateTeamController);
router.delete('/:teamId', deleteTeamController);

module.exports = router;

// const express = require('express');
// const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');

// const router = express.Router();

// router.post('/', createProject);
// router.get('/', getProjects);
// router.put('/:id', updateProject);
// router.delete('/:id', deleteProject);

// module.exports = router;


const express = require('express');
const { 
  createProjectController, 
  getProjectsController, 
  updateProjectController, 
  deleteProjectController 
} = require('../controllers/projectController');

const router = express.Router();

// Route to create a new project
router.post('/', createProjectController);

// Route to get all projects
router.get('/', getProjectsController);

// Route to update a project by ID
router.put('/:id', updateProjectController);

// Route to delete a project by ID
router.delete('/:id', deleteProjectController);

module.exports = router;

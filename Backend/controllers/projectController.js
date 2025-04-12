// const Project = require('../models/project');

// // @desc Create a new project
// // @route POST /api/projects
// const createProject = async (req, res) => {
//   try {
//     const { id, name, requiredSkills, teamSize } = req.body;
//     const project = await Project.createProject({ id, name, requiredSkills, teamSize });
//     res.status(201).json(project);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc Get all projects
// // @route GET /api/projects
// const getProjects = async (req, res) => {
//   try {
//     const projects = await Project.getProjects();
//     res.status(200).json(projects);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc Update a project
// // @route PUT /api/projects/:id
// const updateProject = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, requiredSkills, teamSize } = req.body;
//     const updatedProject = await Project.updateProject(id, { name, requiredSkills, teamSize });
//     if (!updatedProject) {
//       return res.status(404).json({ message: 'Project not found' });
//     }
//     res.status(200).json(updatedProject);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc Delete a project
// // @route DELETE /api/projects/:id
// const deleteProject = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedProject = await Project.deleteProject(id);
//     if (!deletedProject) {
//       return res.status(404).json({ message: 'Project not found' });
//     }
//     res.status(200).json({ message: 'Project deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { createProject, getProjects, updateProject, deleteProject };


const { createProject, getProjects, updateProject, deleteProject } = require('../models/project');

const createProjectController = async (req, res) => {
  const { id, name, requiredSkills } = req.body;  // Removed teamSize from the request

  try {
    const response = await createProject({ id, name, requiredSkills });  // Removed teamSize from the call
    res.status(201).json({ message: "Project created successfully", ...response });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getProjectsController = async (req, res) => {
  try {
    const projects = await getProjects();
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProjectController = async (req, res) => {
  const { id } = req.params;
  const { name, requiredSkills } = req.body;  // Removed teamSize from the request

  try {
    const updatedProject = await updateProject(id, { name, requiredSkills });  // Removed teamSize from the call
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project updated successfully", ...updatedProject });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteProjectController = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProject = await deleteProject(id);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully", ...deletedProject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProjectController,
  getProjectsController,
  updateProjectController,
  deleteProjectController
};



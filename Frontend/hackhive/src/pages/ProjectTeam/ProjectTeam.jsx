// import React, { useEffect, useState } from "react";
// import axios from "axios";

// function ProjectTeam() {
//   const [projects, setProjects] = useState([]);
//   const [teams, setTeams] = useState([]);
//   const [projectData, setProjectData] = useState({ id: "", name: "", requiredSkills: "" });
//   const [teamData, setTeamData] = useState({ teamId: "", teamName: "", projectId: "", teamSize: "" });

//   // Fetch projects and teams on component mount
//   useEffect(() => {
//     fetchProjects();
//     fetchTeams();
//   }, []);

//   // Fetch all projects from the backend
//   const fetchProjects = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/projects");
//       console.log(res.data);  // Debugging line
//       setProjects(Array.isArray(res.data) ? res.data : []);
//     } catch (error) {
//       console.error("Error fetching projects:", error);
//       setProjects([]); // Set to empty array on error
//     }
//   };

//   // Fetch all teams from the backend
//   const fetchTeams = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/teams");
//       setTeams(Array.isArray(res.data) ? res.data : []);
//     } catch (error) {
//       console.error("Error fetching teams:", error);
//       setTeams([]); // Set to empty array on error
//     }
//   };

//   // Handle the project form submission
//   const handleProjectSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:5000/api/projects", projectData);
//       setProjects([...projects, res.data]);  // Add the new project to the list
//       setProjectData({ id: "", name: "", requiredSkills: "" });  // Reset form fields
//     } catch (error) {
//       console.error("Error creating project:", error);
//     }
//   };

//   // Handle the team form submission
//   const handleTeamSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:5000/api/teams", teamData);
//       setTeams([...teams, res.data]);  // Add the new team to the list
//       setTeamData({ teamId: "", teamName: "", projectId: "", teamSize: "" });  // Reset form fields
//     } catch (error) {
//       console.error("Error creating team:", error);
//     }
//   };

//   return (
//     <div className="container">
//       <h1>Projects & Teams Management</h1>

//       {/* Project Form */}
//       <h2>Create Project</h2>
//       <form onSubmit={handleProjectSubmit}>
//         <input
//           type="text"
//           placeholder="Project ID"
//           value={projectData.id}
//           onChange={(e) => setProjectData({ ...projectData, id: e.target.value })}
//         />
//         <input
//           type="text"
//           placeholder="Project Name"
//           value={projectData.name}
//           onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
//         />
//         <input
//           type="text"
//           placeholder="Required Skills"
//           value={projectData.requiredSkills}
//           onChange={(e) => setProjectData({ ...projectData, requiredSkills: e.target.value })}
//         />
//         <button type="submit">Add Project</button>
//       </form>

//       {/* Projects List */}
//       <h2>Projects</h2>
//       <ul>
//         {Array.isArray(projects) && projects.length > 0 ? (
//           projects.map((p) => (
//             <li key={p.id}>
//               ID: {p.id} - Name: {p.name} - Skills: {p.requiredSkills}
//             </li>
//           ))
//         ) : (
//           <p>No projects available</p>
//         )}
//       </ul>

//       {/* Team Form */}
//       <h2>Create Team</h2>
//       <form onSubmit={handleTeamSubmit}>
//         <input
//           type="text"
//           placeholder="Team ID"
//           value={teamData.teamId}
//           onChange={(e) => setTeamData({ ...teamData, teamId: e.target.value })}
//         />
//         <input
//           type="text"
//           placeholder="Team Name"
//           value={teamData.teamName}
//           onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
//         />
//         <select
//           value={teamData.projectId}
//           onChange={(e) => setTeamData({ ...teamData, projectId: e.target.value })}
//         >
//           <option value="">Select Project</option>
//           {Array.isArray(projects) && projects.map((p) => (
//             <option key={p.id} value={p.id}>{p.name}</option>
//           ))}
//         </select>
//         <input
//           type="number"
//           placeholder="Team Size"
//           value={teamData.teamSize}
//           onChange={(e) => setTeamData({ ...teamData, teamSize: e.target.value })}
//         />
//         <button type="submit">Add Team</button>
//       </form>

//       {/* Teams List */}
//       <h2>Teams</h2>
//       <ul>
//         {Array.isArray(teams) && teams.length > 0 ? (
//           teams.map((t) => (
//             <li key={t.teamId}>
//               ID: {t.teamId} - Name: {t.teamName} - Project ID: {t.projectId} - Team Size: {t.teamSize}
//             </li>
//           ))
//         ) : (
//           <p>No teams available</p>
//         )}
//       </ul>
//     </div>
//   );
// }

// export default ProjectTeam;




import { useEffect, useState } from "react";
import axios from "axios";
import "./ProjectTeam.css";

function ProjectTeam() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projectData, setProjectData] = useState({ id: "", name: "", requiredSkills: "" });
  const [teamData, setTeamData] = useState({ teamId: "", teamName: "", projectId: "", teamSize: "" });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, []);

  async function fetchProjects() {
    try {
      const res = await axios.get("http://localhost:5000/api/projects");
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  async function fetchTeams() {
    try {
      const res = await axios.get("http://localhost:5000/api/teams");
      setTeams(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  }

  async function handleProjectSubmit(e) {
    e.preventDefault();
    const updatedProject = { ...projectData, requiredSkills: projectData.requiredSkills.split(",").map(skill => skill.trim()) };

    try {
      if (editingProjectId) {
        await axios.put(`http://localhost:5000/api/projects/${editingProjectId}`, updatedProject);
      } else {
        await axios.post("http://localhost:5000/api/projects", updatedProject);
      }
      setProjectData({ id: "", name: "", requiredSkills: "" });
      setEditingProjectId(null);
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  }

  async function handleTeamSubmit(e) {
    e.preventDefault();
    try {
      if (editingTeamId) {
        await axios.put(`http://localhost:5000/api/teams/${editingTeamId}`, teamData);
      } else {
        await axios.post("http://localhost:5000/api/teams", teamData);
      }
      setTeamData({ teamId: "", teamName: "", projectId: "", teamSize: "" });
      setEditingTeamId(null);
      fetchTeams();
    } catch (error) {
      console.error("Error saving team:", error);
    }
  }

  async function handleProjectDelete(id) {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }

  async function handleTeamDelete(teamId) {
    try {
      await axios.delete(`http://localhost:5000/api/teams/${teamId}`);
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  }

  function handleEditProject(project) {
    setEditingProjectId(project.id);
    setProjectData({
      id: project.id,
      name: project.name,
      requiredSkills: project.requiredSkills.join(", ")
    });
  }

  function handleEditTeam(team) {
    setEditingTeamId(team.teamId);
    setTeamData({
      teamId: team.teamId,
      teamName: team.teamName,
      projectId: team.projectId,
      teamSize: team.teamSize
    });
  }

  return (
    <div>
  <h1 className="text-2xl font-bold text-primary mb-4 text-center">Manage Projects & Teams</h1>

  <div className="container-sections">
    {/* Project Section */}
    <div className="section">
      <h2 className="text-xl font-semibold text-primary mb-2">{editingProjectId ? "Edit Project" : "Add Project"}</h2>
      <form onSubmit={handleProjectSubmit} className="form-row">
        <input type="text" placeholder="Project ID" value={projectData.id} onChange={(e) => setProjectData({ ...projectData, id: e.target.value })} required className="input" />
        <input type="text" placeholder="Project Name" value={projectData.name} onChange={(e) => setProjectData({ ...projectData, name: e.target.value })} required className="input" />
        <input type="text" placeholder="Required Skills (comma-separated)" value={projectData.requiredSkills} onChange={(e) => setProjectData({ ...projectData, requiredSkills: e.target.value })} required className="input" />
        <button type="submit" className="btn">{editingProjectId ? "Update" : "Add"} Project</button>
      </form>

      <h2 className="text-xl font-semibold text-primary mb-2">Projects</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-yellow-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Required Skills</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td className="border px-4 py-2">{p.id}</td>
              <td className="border px-4 py-2">{p.name}</td>
              <td className="border px-4 py-2">{p.requiredSkills.join(", ")}</td>
              <td className="border px-4 py-2">
                <button onClick={() => handleEditProject(p)} className="btn-edit">Edit</button>
                <button onClick={() => handleProjectDelete(p.id)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Team Section */}
    <div className="section">
      <h2 className="text-xl font-semibold text-primary mb-2">{editingTeamId ? "Edit Team" : "Add Team"}</h2>
      <form onSubmit={handleTeamSubmit} className="form-row">
        <input type="text" placeholder="Team ID" value={teamData.teamId} onChange={(e) => setTeamData({ ...teamData, teamId: e.target.value })} required className="input" />
        <input type="text" placeholder="Team Name" value={teamData.teamName} onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })} required className="input" />
        <select value={teamData.projectId} onChange={(e) => setTeamData({ ...teamData, projectId: e.target.value })} required className="input">
          <option value="">Select Project</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="number" placeholder="Team Size" value={teamData.teamSize} onChange={(e) => setTeamData({ ...teamData, teamSize: e.target.value })} required className="input" />
        <button type="submit" className="btn">{editingTeamId ? "Update" : "Add"} Team</button>
      </form>

      <h2 className="text-xl font-semibold text-primary mb-2">Teams</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-yellow-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Size</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.teamId}>
              <td className="border px-4 py-2">{t.teamId}</td>
              <td className="border px-4 py-2">{t.teamName}</td>
              <td className="border px-4 py-2">{t.teamSize}</td>
              <td className="border px-4 py-2">
                <button onClick={() => handleEditTeam(t)} className="btn-edit">Edit</button>
                <button onClick={() => handleTeamDelete(t.teamId)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

  );
}

export default ProjectTeam;

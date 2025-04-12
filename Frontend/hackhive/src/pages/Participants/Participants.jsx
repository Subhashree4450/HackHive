// import { useEffect, useState } from "react";
// import axios from "axios";

// function Participants() {
//   const [participants, setParticipants] = useState([]);
//   const [formData, setFormData] = useState({ id: "", name: "", email: "", skills: "", experience: "" });
//   const [editingId, setEditingId] = useState(null);

//   useEffect(() => {
//     fetchParticipants();
//   }, []);

//   async function fetchParticipants() {
//     try {
//       const res = await axios.get("http://localhost:5000/api/participants");
//       setParticipants(res.data);
//     } catch (error) {
//       console.error("Error fetching participants:", error);
//     }
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     try {
//       if (editingId) {
//         await axios.put(`http://localhost:5000/api/participants/${editingId}`, formData);
//       } else {
//         await axios.post("http://localhost:5000/api/participants", formData);
//       }
//       setFormData({ id: "", name: "", email: "", skills: "", experience: "" });
//       setEditingId(null);
//       fetchParticipants();
//     } catch (error) {
//       console.error("Error saving participant:", error);
//     }
//   }

//   async function handleDelete(id) {
//     try {
//       await axios.delete(`http://localhost:5000/api/participants/${id}`);
//       fetchParticipants();
//     } catch (error) {
//       console.error("Error deleting participant:", error);
//     }
//   }

//   return (
//     <div>
//       <h1 className="text-2xl font-bold text-primary mb-4">Manage Participants</h1>

//       <form onSubmit={handleSubmit} className="mb-6">
//         <input type="text" placeholder="ID" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} required className="input" />
//         <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="input" />
//         <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="input" />
//         <input type="text" placeholder="Skills" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} required className="input" />
//         <input type="number" placeholder="Experience (years)" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} required className="input" />
//         <button type="submit" className="btn">{editingId ? "Update" : "Add"} Participant</button>
//       </form>

//       <table className="table-auto w-full border-collapse border border-gray-300">
//         <thead>
//           <tr className="bg-yellow-100">
//             <th className="border px-4 py-2">ID</th>
//             <th className="border px-4 py-2">Name</th>
//             <th className="border px-4 py-2">Email</th>
//             <th className="border px-4 py-2">Skills</th>
//             <th className="border px-4 py-2">Experience</th>
//             <th className="border px-4 py-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {participants.map((p) => (
//             <tr key={p.id}>
//               <td className="border px-4 py-2">{p.id}</td>
//               <td className="border px-4 py-2">{p.name}</td>
//               <td className="border px-4 py-2">{p.email}</td>
//               <td className="border px-4 py-2">{p.skills}</td>
//               <td className="border px-4 py-2">{p.experience} years</td>
//               <td className="border px-4 py-2">
//                 <button onClick={() => setEditingId(p.id) || setFormData(p)} className="btn-edit">Edit</button>
//                 <button onClick={() => handleDelete(p.id)} className="btn-delete">Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default Participants;



import { useEffect, useState } from "react";
import axios from "axios";
import "./Participants.css";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [formData, setFormData] = useState({ id: "", name: "", email: "", skills: "", experience: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  async function fetchParticipants() {
    try {
      const res = await axios.get("http://localhost:5000/api/participants");
      setParticipants(res.data);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  }

  // Handle form submission for both adding and editing
  async function handleSubmit(e) {
    e.preventDefault();
    
    // Convert skills string into an array by splitting by commas and trimming spaces
    const skillsArray = formData.skills.split(",").map(skill => skill.trim());
    
    // Update the formData with the skills array
    const updatedFormData = { ...formData, skills: skillsArray };
    
    try {
      if (editingId) {
        // Update participant
        await axios.put(`http://localhost:5000/api/participants/${editingId}`, updatedFormData);
      } else {
        // Create new participant
        await axios.post("http://localhost:5000/api/participants", updatedFormData);
      }
      setFormData({ id: "", name: "", email: "", skills: "", experience: "" });
      setEditingId(null);
      fetchParticipants();
    } catch (error) {
      console.error("Error saving participant:", error);
    }
  }

  // Handle participant deletion
  async function handleDelete(id) {
    try {
      await axios.delete(`http://localhost:5000/api/participants/${id}`);
      fetchParticipants();
    } catch (error) {
      console.error("Error deleting participant:", error);
    }
  }

  // Handle editing a participant
  function handleEdit(p) {
    setEditingId(p.id);
    setFormData({
      id: p.id,
      name: p.name,
      email: p.email,
      skills: p.skills.join(", "), // Join skills array into a comma-separated string for the form
      experience: p.experience
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-4">Manage Participants</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div class="form-row">
        <input type="text" placeholder="ID" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} required className="input" />
        <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="input" />
        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="input" />
        
        {/* Handle skills input as comma-separated values and split into an array */}
        <input type="text" placeholder="Skills (comma-separated)" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} required className="input" />
        
        <input type="number" placeholder="Experience (years)" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} required className="input" />
        </div>
        <button type="submit" className="btn">{editingId ? "Update" : "Add"} Participant</button>
      </form>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-yellow-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Skills</th>
            <th className="border px-4 py-2">Experience</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id}>
              <td className="border px-4 py-2">{p.id}</td>
              <td className="border px-4 py-2">{p.name}</td>
              <td className="border px-4 py-2">{p.email}</td>
              {/* Display skills as a comma-separated string */}
              <td className="border px-4 py-2">{p.skills.join(", ")}</td>
              <td className="border px-4 py-2">{p.experience} years</td>
              <td className="border px-4 py-2">
                <button onClick={() => handleEdit(p)} className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Participants;

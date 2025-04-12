// import React, { useState } from 'react';
// import axios from 'axios';
// import { XMLParser } from 'fast-xml-parser';
// import './FetchData.css';

// const mongoFields = [
//   { label: 'Participant ID', value: 'id' },
//   { label: 'Participant Name', value: 'name' },
//   { label: 'Email', value: 'email' },
//   { label: 'Skills', value: 'skills' },
//   { label: 'Experience', value: 'experience' },
//   { label: 'Assigned Team', value: 'assigned_team' },
// ];

// const neo4jFields = [
//   { label: 'Team ID', value: 'teamId' },
//   { label: 'Team Name', value: 'teamName' },
//   { label: 'Team Size', value: 'teamSize' },
//   { label: 'Project ID', value: 'project_id' },
//   { label: 'Project Name', value: 'project_name' },
//   { label: 'Required Skills', value: 'requiredSkills' },
// ];

// const FetchData = () => {
//   const [selectedFields, setSelectedFields] = useState([]);
//   const [xmlResponse, setXmlResponse] = useState('');
//   const [parsedData, setParsedData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);

//   const handleChange = (e) => {
//     const { value, checked } = e.target;
//     setSelectedFields((prev) =>
//       checked ? [...prev, value] : prev.filter((v) => v !== value)
//     );
//   };

//   const handleSubmit = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:5000/api/fetch-data', {
//         selectedFields,
//       });
  
//       const xml = response.data;
//       setXmlResponse(xml);
  
//       const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
//       const json = parser.parse(xml);
  
//       // Combine both mongo and neo fields for lookup
//       const fieldMap = [...mongoFields, ...neo4jFields].reduce((acc, item) => {
//         acc[item.value] = item.label;
//         return acc;
//       }, {});
  
//       const extractSelectedFields = (obj) => {
//         let result = [];
  
//         const recurse = (node) => {
//           if (typeof node !== 'object') return;
  
//           for (const key in node) {
//             const val = node[key];
  
//             if (typeof val === 'object') {
//               recurse(val);
//             }
  
//             // Check if key starts with "@_" and is in selectedFields
//             if (key.startsWith('@_') && selectedFields.includes(key.slice(2))) {
//               const fieldKey = key.slice(2);
//               const label = fieldMap[fieldKey] || fieldKey;
//               result.push(`${label}: ${val}`);
//             }
  
//             // For nested non-attribute keys (like project_name, teamSize)
//             if (!key.startsWith('@_') && selectedFields.includes(key)) {
//               const label = fieldMap[key] || key;
//               result.push(`${label}: ${val}`);
//             }
//           }
//         };
  
//         recurse(obj);
//         return result;
//       };
  
//       const flatData = extractSelectedFields(json);
//       setParsedData(flatData);
//     } catch (err) {
//       console.error(err);
//       setXmlResponse('<error>Something went wrong</error>');
//     }
//     setLoading(false);
//   };
  

//   return (
//     <div className="fetch-data">
//       <h2>Select Fields to Fetch Data</h2>
//       <div className="checkbox-container">
//         <div>
//           <h4>Participants (MongoDB)</h4>
//           <div className="checkbox-grid">
//             {mongoFields.map((field) => (
//               <label key={field.value}>
//                 <input
//                   type="checkbox"
//                   value={field.value}
//                   onChange={handleChange}
//                   checked={selectedFields.includes(field.value)}
//                 />
//                 {field.label}
//               </label>
//             ))}
//           </div>
//         </div>
//         <div>
//           <h4>Teams & Projects (Neo4j)</h4>
//           <div className="checkbox-grid">
//             {neo4jFields.map((field) => (
//               <label key={field.value}>
//                 <input
//                   type="checkbox"
//                   value={field.value}
//                   onChange={handleChange}
//                   checked={selectedFields.includes(field.value)}
//                 />
//                 {field.label}
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       <button onClick={handleSubmit} disabled={loading}>
//         {loading ? 'Fetching...' : 'Fetch XML'}
//       </button>

//       <h3>Parsed Data</h3>

//       {parsedData ? (
//         <ul className="parsed-list">
//           {parsedData.map((item, idx) => (
//             <li key={idx}>{item}</li>
//           ))}
//         </ul>
//       ) : (
//         <p>No data fetched yet.</p>
//       )}

//       {xmlResponse && (
//         <button className="show-xml-btn" onClick={() => setShowPopup(true)}>
//           Show Raw XML
//         </button>
//       )}

//       {showPopup && (
//         <div className="popup-overlay">
//           <div className="popup-content">
//             <button className="close-btn" onClick={() => setShowPopup(false)}>
//               Close
//             </button>
//             <pre className="xml-box">{xmlResponse}</pre>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FetchData;










import React, { useState } from "react";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import "./FetchData.css";

const fieldOptions = {
  Participants: ["id", "name", "email", "skills", "experience", "assigned_team"],
  Teams: ["teamId", "teamName", "teamSize"],
  Projects: ["id", "project_name", "requiredSkills"]
};

const FetchData = () => {
  const [selectedFields, setSelectedFields] = useState([]);
  const [data, setData] = useState({ Participants: [], Teams: [], Projects: [] });
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/fetch-data", { selectedFields }, { headers: { Accept: "application/xml" } });
      const parser = new XMLParser({ ignoreAttributes: false });
      const parsed = parser.parse(res.data);

      const schema = parsed?.Schema || {};
      setData({
        Participants: schema.Participants?.map(p => p.Participant) || [],
        Teams: schema.Teams?.Team || [],
        Projects: schema.Projects?.Project || [],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const renderGroup = (groupName, items) => (
    <div className="border p-4 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-3">{groupName}</h2>
      {items.length === 0 ? (
        <p>No data available.</p>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="mb-2 border-b pb-2">
            {Object.entries(item).map(([key, value]) => (
              <div key={key}>
                <strong>{key.replace(/^@/, "")}:</strong>{" "}
                {Array.isArray(value.Skill) ? value.Skill.join(", ") : value}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="datafetcher-wrapper">
    {/* Left Section */}
    <div className="datafetcher-sidebar">
      <h1 className="datafetcher-title">Select Fields</h1>
  
      {Object.entries(fieldOptions).map(([group, fields]) => (
        <div key={group} className="datafetcher-group">
          <h3 className="datafetcher-group-title">{group}</h3>
          <div className="checkbox-grid">
            {fields.map((field) => (
              <label key={field} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field)}
                  onChange={() => handleCheckboxChange(field)}
                />
                <span>{field}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
  
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="fetch-button"
      >
        {loading ? "Loading..." : "Fetch Data"}
      </button>
    </div>
  
    {/* Right Section */}
    <div className="datafetcher-content">
      {renderGroup("Participants", data.Participants)}
      {renderGroup("Teams", data.Teams)}
      {renderGroup("Projects", data.Projects)}
    </div>
  </div>
  
  
  );
};

export default FetchData;

// const fs = require("fs");
// const path = require("path");
// const { driver } = require("../config/neo4j");
// const Participant = require("../models/particpants");
// const xmlbuilder = require("xmlbuilder2");
// const libxmljs = require("libxmljs2");

// // ✅ Field Groups
// const mongoFields = ["id", "name", "email", "skills", "experience", "assigned_team"];
// const neoTeamFields = ["teamId", "teamName", "teamSize"];
// const neoProjectFields = ["project_name", "requiredSkills", "teamSize", "id"];
// const specialFields = ["BELONGS_TO"];

// // ✅ Load XSD Schema
// const xsdPath = path.join(__dirname, "..", "config", "global.xsd");
// let xsdContent;

// try {
//   xsdContent = fs.readFileSync(xsdPath, "utf8");
//   console.log("✅ XSD schema loaded successfully.");
// } catch (err) {
//   console.error("❌ Error loading XSD schema:", err.message);
//   process.exit(1);
// }

// exports.fetchData = async (req, res) => {
//   try {
//     const selectedFields = req.body.selectedFields;
//     if (!selectedFields || selectedFields.length === 0) {
//       return res.status(400).json({ message: "No fields selected." });
//     }

//     const selectedMongoFields = selectedFields.filter(f => mongoFields.includes(f));
//     const needsNeoTeamData = selectedFields.some(f => neoTeamFields.includes(f));
//     const needsNeoProjectData = selectedFields.some(f => neoProjectFields.includes(f));
//     const needsBelongsTo = selectedFields.includes("BELONGS_TO");

//     // 1. MongoDB Participants
//     let participants = [];
//     if (selectedMongoFields.length > 0 || needsBelongsTo) {
//       const projection = {};
//       selectedMongoFields.forEach(field => projection[field] = 1);
//       participants = await Participant.find({}, projection).lean();
//     }

//     // 2. BELONGS_TO (if needed)
//     let belongsToMap = new Map();
//     if (needsBelongsTo) {
//       const session = driver.session();
//       const result = await session.run(`
//         MATCH (s:Student)-[:BELONGS_TO]->(t:Team)
//         RETURN s.name AS studentName, t.teamId AS teamId, t.teamName AS teamName
//       `);
//       result.records.forEach(record => {
//         belongsToMap.set(record.get("studentName"), {
//           teamId: record.get("teamId"),
//           teamName: record.get("teamName")
//         });
//       });
//       await session.close();
//     }

//     // 3. Neo4j Team Nodes
//     let teamData = [];
//     if (needsNeoTeamData) {
//       const session = driver.session();
//       const result = await session.run(`MATCH (t:Team) RETURN t.teamId AS teamId, t.teamName AS teamName`);
//       result.records.forEach(record => {
//         teamData.push({
//           teamId: record.get("teamId"),
//           teamName: record.get("teamName")
//         });
//       });
//       await session.close();
//     }

//     // 4. Neo4j Project Nodes
//     let projectData = [];
//     if (needsNeoProjectData) {
//       const session = driver.session();
//       const result = await session.run(`
//         MATCH (p:Project)
//         RETURN p.id AS projectId, p.name AS projectName, 
//                p.requiredSkills AS requiredSkills, p.teamSize AS teamSize
//       `);
//       result.records.forEach(record => {
//         projectData.push({
//           id: record.get("projectId"),
//           name: record.get("projectName"),
//           requiredSkills: record.get("requiredSkills"),
//           teamSize: record.get("teamSize")
//         });
//       });
//       await session.close();
//     }

//     // 5. Build XML Object
//     const xmlObj = { Schema: {} };

//     // Participants
//     if (participants.length > 0) {
//       xmlObj.Schema.Participants = participants.map(p => {
//         const xmlP = {};
//         if (selectedMongoFields.includes("id")) xmlP["@id"] = p.id || "unknown";
//         if (selectedMongoFields.includes("name")) xmlP["@name"] = p.name || "unknown";
//         if (selectedMongoFields.includes("email")) xmlP["@email"] = p.email || "unknown";
//         if (selectedMongoFields.includes("experience")) xmlP["@experience"] = p.experience != null ? p.experience : "0";
//         if (selectedMongoFields.includes("skills") && p.skills) xmlP.Skills = { Skill: p.skills };
//         if (selectedMongoFields.includes("assigned_team") && p.assigned_team) xmlP.AssignedTeam = p.assigned_team;

//         if (needsBelongsTo) {
//           const teamInfo = belongsToMap.get(p.name);
//           if (teamInfo) {
//             xmlP.BelongsTo = {
//               "@teamId": teamInfo.teamId || "unknown",
//               "@teamName": teamInfo.teamName || "unknown",
//               "@teamSize": teamInfo.teamSize || "unknown"
//             };
//           }
//         }

//         return { Participant: xmlP };
//       });
//     }

//     // Teams
//     if (needsNeoTeamData && teamData.length > 0) {
//       xmlObj.Schema.Teams = {
//         Team: teamData.map(t => {
//           const teamXml = {};
//           if (selectedFields.includes("teamId")) teamXml["@teamId"] = t.teamId;
//           if (selectedFields.includes("teamName")) teamXml["@teamName"] = t.teamName;
//           if (selectedFields.includes("teamSize")) teamXml["@teamSize"] = t.teamSize;
//           return teamXml;
//         })
//       };
//     }

//     // Projects
//     if (needsNeoProjectData && projectData.length > 0) {
//       xmlObj.Schema.Projects = {
//         Project: projectData.map(p => {
//           const projXml = {};
//           if (selectedFields.includes("id")) projXml["@id"] = p.id || "unknown";
//           if (selectedFields.includes("project_name")) projXml["@name"] = p.name || "unknown";
//           if (selectedFields.includes("requiredSkills") && p.requiredSkills) {
//             projXml.RequiredSkills = { Skill: p.requiredSkills };
//           }
//           // if (selectedFields.includes("teamSize") && p.teamSize != null) {
//           //   projXml.TeamSize = parseInt(p.teamSize);
//           // }
//           return projXml;
//         })
//       };
//     }

//     // 6. Generate and Validate XML
//     const xml = xmlbuilder.create(xmlObj).end({ prettyPrint: true });
//     const xmlDoc = libxmljs.parseXml(xml);
//     const xsdDoc = libxmljs.parseXml(xsdContent);

//     if (!xmlDoc.validate(xsdDoc)) {
//       console.error("❌ XML Validation Failed:", xmlDoc.validationErrors);
//       return res.status(400).json({ error: "XML validation failed", details: xmlDoc.validationErrors });
//     }

//     // 7. Return XML
//     res.set("Content-Type", "application/xml");
//     res.send(xml);

//   } catch (err) {
//     console.error("❌ fetchData error:", err.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


const fs = require("fs");
const path = require("path");
const { driver } = require("../config/neo4j");
const Participant = require("../models/particpants");
const xmlbuilder = require("xmlbuilder2");
const libxmljs = require("libxmljs2");

// ✅ Field Groups
const mongoFields = ["id", "name", "email", "skills", "experience", "assigned_team"];
const neoTeamFields = ["teamId", "teamName", "teamSize"];
const neoProjectFields = ["project_name", "requiredSkills", "teamSize", "id"];
const specialFields = ["BELONGS_TO"];

// ✅ Load XSD Schema
const xsdPath = path.join(__dirname, "..", "config", "global.xsd");
let xsdContent;

try {
  xsdContent = fs.readFileSync(xsdPath, "utf8");
  console.log("✅ XSD schema loaded successfully.");
} catch (err) {
  console.error("❌ Error loading XSD schema:", err.message);
  process.exit(1);
}

exports.fetchData = async (req, res) => {
  try {
    const selectedFields = req.body.selectedFields;
    if (!selectedFields || selectedFields.length === 0) {
      return res.status(400).json({ message: "No fields selected." });
    }

    const selectedMongoFields = selectedFields.filter(f => mongoFields.includes(f));
    const selectedTeamFields = selectedFields.filter(f => neoTeamFields.includes(f));
    const selectedProjectFields = selectedFields.filter(f => neoProjectFields.includes(f));

    const needsNeoTeamData = selectedTeamFields.length > 0;
    const needsNeoProjectData = selectedProjectFields.length > 0;
    const needsBelongsTo = selectedFields.includes("BELONGS_TO");

    // 1. MongoDB Participants
    let participants = [];
    if (selectedMongoFields.length > 0 || needsBelongsTo) {
      const projection = {};
      selectedMongoFields.forEach(field => projection[field] = 1);
      participants = await Participant.find({}, projection).lean();
    }

    // 2. BELONGS_TO (if needed)
    let belongsToMap = new Map();
    if (needsBelongsTo) {
      const session = driver.session();
      const result = await session.run(`
        MATCH (s:Student)-[:BELONGS_TO]->(t:Team)
        RETURN s.name AS studentName, t.teamId AS teamId, t.teamName AS teamName
      `);
      result.records.forEach(record => {
        belongsToMap.set(record.get("studentName"), {
          teamId: record.get("teamId"),
          teamName: record.get("teamName")
        });
      });
      await session.close();
    }

    // 3. Neo4j Team Nodes
    let teamData = [];
    if (needsNeoTeamData) {
      const session = driver.session();
      const result = await session.run(`
        MATCH (t:Team)
        RETURN t.teamId AS teamId, t.teamName AS teamName, t.teamSize AS teamSize
      `);
      result.records.forEach(record => {
        teamData.push({
          teamId: record.get("teamId"),
          teamName: record.get("teamName"),
          teamSize: record.get("teamSize")
        });
      });
      await session.close();
    }

    // 4. Neo4j Project Nodes
    let projectData = [];
    if (needsNeoProjectData) {
      const session = driver.session();
      const result = await session.run(`
        MATCH (p:Project)
        RETURN p.id AS projectId, p.name AS projectName, 
               p.requiredSkills AS requiredSkills, p.teamSize AS teamSize
      `);
      result.records.forEach(record => {
        projectData.push({
          id: record.get("projectId"),
          name: record.get("projectName"),
          requiredSkills: record.get("requiredSkills"),
          teamSize: record.get("teamSize")
        });
      });
      await session.close();
    }

    // 5. Build XML Object
    const xmlObj = { Schema: {} };

    // Participants
    if (participants.length > 0) {
      xmlObj.Schema.Participants = participants.map(p => {
        const xmlP = {};
        if (selectedMongoFields.includes("id")) xmlP["@id"] = p.id || "unknown";
        if (selectedMongoFields.includes("name")) xmlP["@name"] = p.name || "unknown";
        if (selectedMongoFields.includes("email")) xmlP["@email"] = p.email || "unknown";
        if (selectedMongoFields.includes("experience")) xmlP["@experience"] = p.experience != null ? p.experience : "0";
        if (selectedMongoFields.includes("skills") && p.skills) xmlP.Skills = { Skill: p.skills };
        if (selectedMongoFields.includes("assigned_team") && p.assigned_team) xmlP.AssignedTeam = p.assigned_team;

        if (needsBelongsTo) {
          const teamInfo = belongsToMap.get(p.name);
          if (teamInfo) {
            xmlP.BelongsTo = {
              "@teamId": teamInfo.teamId || "unknown",
              "@teamName": teamInfo.teamName || "unknown",
              "@teamSize": teamInfo.teamSize || "unknown"
            };
          }
        }

        return { Participant: xmlP };
      });
    }

    // Teams
    if (needsNeoTeamData && teamData.length > 0) {
      xmlObj.Schema.Teams = {
        Team: teamData.map(t => {
          const teamXml = {};
          if (selectedTeamFields.includes("teamId")) teamXml["@teamId"] = t.teamId;
          if (selectedTeamFields.includes("teamName")) teamXml["@teamName"] = t.teamName;
          if (selectedTeamFields.includes("teamSize")) teamXml["@teamSize"] = t.teamSize;
          return teamXml;
        })
      };
    }

    // Projects
    if (needsNeoProjectData && projectData.length > 0) {
      xmlObj.Schema.Projects = {
        Project: projectData.map(p => {
          const projXml = {};
          if (selectedProjectFields.includes("id")) projXml["@id"] = p.id || "unknown";
          if (selectedProjectFields.includes("project_name")) projXml["@name"] = p.name || "unknown";
          if (selectedProjectFields.includes("requiredSkills") && p.requiredSkills) {
            projXml.RequiredSkills = { Skill: p.requiredSkills };
          }
          if (selectedProjectFields.includes("teamSize") && p.teamSize != null) {
            projXml["@teamSize"] = p.teamSize;
          }
          return projXml;
        })
      };
    }

    // 6. Generate and Validate XML
    const xml = xmlbuilder.create(xmlObj).end({ prettyPrint: true });
    const xmlDoc = libxmljs.parseXml(xml);
    const xsdDoc = libxmljs.parseXml(xsdContent);

    if (!xmlDoc.validate(xsdDoc)) {
      console.error("❌ XML Validation Failed:", xmlDoc.validationErrors);
      return res.status(400).json({ error: "XML validation failed", details: xmlDoc.validationErrors });
    }

    // 7. Return XML
    res.set("Content-Type", "application/xml");
    res.send(xml);

  } catch (err) {
    console.error("❌ fetchData error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


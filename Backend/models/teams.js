// const connectNeo4j = require('../config/neo4j');

// let driver;

// const initDriver = async () => {
//   if (!driver) {
//     driver = await connectNeo4j(); // ✅ Initialize driver once
//   }
// };

// const createTeam = async ({ teamId, teamName, projectId, teamSize }) => {
//   await initDriver(); // ✅ Ensure driver is initialized
//   const session = driver.session(); // ✅ Create session from driver
//   try {
//     const result = await session.run(
//       `
//       CREATE (t:Team {
//         teamId: $teamId,
//         teamName: $teamName,
//         projectId: $projectId,
//         teamSize: $teamSize
//       })
//       RETURN t
//       `,
//       {
//         teamId,
//         teamName,
//         projectId,
//         teamSize
//       }
//     );
//     return result.records[0].get('t').properties;
//   } finally {
//     await session.close(); // ✅ Always close session
//   }
// };

// const getTeams = async () => {
//   await initDriver(); // ✅ Ensure driver is initialized
//   const session = driver.session(); // ✅ Create session from driver
//   try {
//     const result = await session.run(
//       `
//       MATCH (t:Team)
//       RETURN t
//       `
//     );
//     return result.records.map((record) => record.get('t').properties);
//   } finally {
//     await session.close(); // ✅ Always close session
//   }
// };

// const updateTeam = async (teamId, { teamName, projectId, teamSize }) => {
//   await initDriver(); // ✅ Ensure driver is initialized
//   const session = driver.session(); // ✅ Create session from driver
//   try {
//     const result = await session.run(
//       `
//       MATCH (t:Team { teamId: $teamId })
//       SET t.teamName = $teamName,
//           t.projectId = $projectId,
//           t.teamSize = $teamSize
//       RETURN t
//       `,
//       {
//         teamId,
//         teamName,
//         projectId,
//         teamSize
//       }
//     );
//     if (result.records.length === 0) return null;
//     return result.records[0].get('t').properties;
//   } finally {
//     await session.close(); // ✅ Always close session
//   }
// };

// const deleteTeam = async (teamId) => {
//   await initDriver(); // ✅ Ensure driver is initialized
//   const session = driver.session(); // ✅ Create session from driver
//   try {
//     const result = await session.run(
//       `
//       MATCH (t:Team { teamId: $teamId })
//       DELETE t
//       RETURN t
//       `,
//       { teamId }
//     );
//     if (result.records.length === 0) return null;
//     return result.records[0].get('t').properties;
//   } finally {
//     await session.close(); // ✅ Always close session
//   }
// };

// module.exports = { createTeam, getTeams, updateTeam, deleteTeam };



const {connectNeo4j} = require('../config/neo4j');

let driver;

const initDriver = async () => {
  if (!driver) {
    driver = await connectNeo4j(); // ✅ Ensure driver is initialized
  }
};

// ✅ Create a Team & Link to an Existing Project
const createTeam = async ({ teamId, teamName, projectId, teamSize }) => {
  await initDriver();
  const session = driver.session();
  
  try {
    const result = await session.run(
      `
      MATCH (p:Project { id: $projectId })  // 🔹 Match existing project
      CREATE (t:Team {
        teamId: $teamId,
        teamName: $teamName,
        teamSize: $teamSize
      })-[:WORKS_ON]->(p)  
      RETURN t, p
      `,
      { teamId, teamName, projectId, teamSize }
    );

    if (result.records.length === 0) {
      throw new Error("Project ID not found.");
    }

    return {
      team: result.records[0].get('t').properties,
      project: result.records[0].get('p').properties
    };
  } finally {
    await session.close();
  }
};

// ✅ Get All Teams with their Project Relationship
const getTeams = async () => {
  await initDriver();
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (t:Team)-[:WORKS_ON]->(p:Project)
      RETURN t, p
      `
    );

    return result.records.map(record => ({
      ...record.get('t').properties,
      projectId: record.get('p').properties.projectId
    }));
  } finally {
    await session.close();
  }
};

// ✅ Update a Team & Change Project Relationship
const updateTeam = async (teamId, { teamName, projectId, teamSize }) => {
  await initDriver();
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (t:Team { teamId: $teamId })-[r:WORKS_ON]->(pOld:Project)
      MATCH (pNew:Project { id: $projectId })  // 🔹 Ensure project exists
      DELETE r
      CREATE (t)-[:WORKS_ON]->(pNew)
      SET t.teamName = $teamName, t.teamSize = $teamSize
      RETURN t, pNew
      `,
      { teamId, teamName, projectId, teamSize }
    );

    if (result.records.length === 0) {
      throw new Error("Team or Project not found.");
    }

    return {
      team: result.records[0].get('t').properties,
      project: result.records[0].get('pNew').properties
    };
  } finally {
    await session.close();
  }
};

// ✅ Delete a Team (Remove Relationship but Keep Project)
const deleteTeam = async (teamId) => {
  await initDriver();
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (t:Team { teamId: $teamId })-[r:WORKS_ON]->(p:Project)
      DELETE r, t
      RETURN t
      `,
      { teamId }
    );

    if (result.records.length === 0) {
      throw new Error("Team not found.");
    }

    return { message: "Team deleted successfully" };
  } finally {
    await session.close();
  }
};

module.exports = { createTeam, getTeams, updateTeam, deleteTeam };


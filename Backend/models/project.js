// const { getSession } = require('../config/neo4j');

// const createProject = async ({ id, name, requiredSkills, teamSize }) => {
//   const session = getSession(); // Get session from config
//   try {
//     const result = await session.run(
//       `
//       CREATE (p:Project {
//         id: $id,
//         name: $name,
//         requiredSkills: $requiredSkills,
//         teamSize: $teamSize
//       })
//       RETURN p
//       `,
//       {
//         id,
//         name,
//         requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
//         teamSize
//       }
//     );
//     return result.records[0]?.get('p').properties;
//   } finally {
//     await session.close();
//   }
// };

// const getProjects = async () => {
//   const session = getSession();
//   try {
//     const result = await session.run(
//       `
//       MATCH (p:Project)
//       RETURN p
//       `
//     );
//     return result.records.map((record) => record.get('p').properties);
//   } finally {
//     await session.close();
//   }
// };

// const updateProject = async (id, { name, requiredSkills, teamSize }) => {
//   const session = getSession();
//   try {
//     const result = await session.run(
//       `
//       MATCH (p:Project { id: $id })
//       SET p.name = $name, 
//           p.requiredSkills = $requiredSkills, 
//           p.teamSize = $teamSize
//       RETURN p
//       `,
//       {
//         id,
//         name,
//         requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
//         teamSize
//       }
//     );
//     if (result.records.length === 0) return null;
//     return result.records[0].get('p').properties;
//   } finally {
//     await session.close();
//   }
// };

// const deleteProject = async (id) => {
//   const session = getSession();
//   try {
//     const result = await session.run(
//       `
//       MATCH (p:Project { id: $id })
//       DELETE p
//       RETURN p
//       `,
//       { id }
//     );
//     if (result.records.length === 0) return null;
//     return result.records[0].get('p').properties;
//   } finally {
//     await session.close();
//   }
// };

// module.exports = { createProject, getProjects, updateProject, deleteProject };


const { connectNeo4j } = require('../config/neo4j');

let driver;

const initDriver = async () => {
  if (!driver) {
    driver = await connectNeo4j(); // ✅ Initialize driver once
  }
};

const createProject = async ({ id, name, requiredSkills }) => {
  await initDriver(); // ✅ Ensure driver is initialized
  const session = driver.session(); // ✅ Create session from driver
  try {
    const result = await session.run(
      `
      CREATE (p:Project {
        id: $id,
        name: $name,
        requiredSkills: $requiredSkills
      })
      RETURN p
      `,
      {
        id,
        name,
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills]
      }
    );
    return result.records[0].get('p').properties;
  } finally {
    await session.close(); // ✅ Always close session
  }
};
// const createProject = async ({ id, name, requiredSkills }) => {
//   await initDriver(); // ✅ Ensure driver is initialized
//   const session = driver.session(); // ✅ Create session from driver
//   try {
//     const skillsArray = typeof requiredSkills === 'string'
//       ? requiredSkills.split(',').map(skill => skill.trim()) // Split by comma and trim spaces
//       : requiredSkills; // If already an array, keep it as it is

//     const result = await session.run(
//       `
//       CREATE (p:Project {
//         id: $id,
//         name: $name,
//         requiredSkills: $requiredSkills
//       })
//       RETURN p
//       `,
//       {
//         id,
//         name,
//         requiredSkills: skillsArray // Store as an array of strings
//       }
//     );
//     return result.records[0].get('p').properties;
//   } finally {
//     await session.close(); // ✅ Always close session
//   }
// };

const getProjects = async () => {
  await initDriver(); // ✅ Ensure driver is initialized
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (p:Project)
      RETURN p
      `
    );
    return result.records.map((record) => record.get('p').properties);
  } finally {
    await session.close();
  }
};

const updateProject = async (id, { name, requiredSkills }) => {
  await initDriver(); // ✅ Ensure driver is initialized
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (p:Project { id: $id })
      SET p.name = $name, 
          p.requiredSkills = $requiredSkills
      RETURN p
      `,
      {
        id,
        name,
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills]
      }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('p').properties;
  } finally {
    await session.close();
  }
};

const deleteProject = async (id) => {
  await initDriver(); // ✅ Ensure driver is initialized
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (p:Project { id: $id })
      DETACH DELETE p
      RETURN p
      `,
      { id }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('p').properties;
  } finally {
    await session.close();
  }
};

module.exports = { createProject, getProjects, updateProject, deleteProject };

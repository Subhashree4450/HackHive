const connectNeo4j = require('../config/neo4j');

let driver;

const initDriver = async () => {
  if (!driver) {
    driver = await connectNeo4j();
  }
};

// ✅ Create relationship: Add a participant to a team
const addParticipantToTeam = async (participantId, teamId) => {
  await initDriver();
  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (p:Participant { id: $participantId })
      WITH p
      MATCH (t:Team { teamId: $teamId })
      MERGE (p)-[:IS_MEMBER_OF]->(t)
      RETURN p, t
      `,
      { participantId, teamId }
    );
    return true;
  } finally {
    await session.close();
  }
};

// ✅ Move participant: Remove existing relationship and assign to a new team
const moveParticipantToTeam = async (participantId, newTeamId) => {
  await initDriver();
  const session = driver.session();
  try {
    // Remove any existing IS_MEMBER_OF relationships for this participant
    await session.run(
      `
      MATCH (p:Participant { id: $participantId })-[r:IS_MEMBER_OF]->(t)
      DELETE r
      `,
      { participantId }
    );
    // Create a new relationship with the new team
    await session.run(
      `
      MATCH (p:Participant { id: $participantId })
      WITH p
      MATCH (newTeam:Team { teamId: $newTeamId })
      MERGE (p)-[:IS_MEMBER_OF]->(newTeam)
      RETURN p, newTeam
      `,
      { participantId, newTeamId }
    );
    return true;
  } finally {
    await session.close();
  }
};

// ✅ Remove relationship: Remove a participant from a specific team
const removeParticipantFromTeam = async (participantId, teamId) => {
  await initDriver();
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (p:Participant { id: $participantId })-[r:IS_MEMBER_OF]->(t:Team { teamId: $teamId })
      DELETE r
      RETURN p
      `,
      { participantId, teamId }
    );
    return true;
  } finally {
    await session.close();
  }
};

// ✅ Get all participants in a team: Returns an array of participant IDs
const getTeamParticipants = async (teamId) => {
  await initDriver();
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (p:Participant)-[:IS_MEMBER_OF]->(t:Team { teamId: $teamId })
      RETURN p.id AS participantId
      `,
      { teamId }
    );
    return result.records.map(record => record.get('participantId'));
  } finally {
    await session.close();
  }
};

module.exports = {
  addParticipantToTeam,
  moveParticipantToTeam,
  removeParticipantFromTeam,
  getTeamParticipants
};

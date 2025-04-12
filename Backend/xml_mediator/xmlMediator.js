const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { driver } = require("../config/neo4j");
const xml2js = require("xml2js");

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

let mapping = null;

// ✅ Load and Parse Mapping XML on Startup
const loadMapping = async () => {
    try {
        const mappingPath = path.join(__dirname, "../config/mapping.xml");
        const data = fs.readFileSync(mappingPath, "utf-8");
        mapping = await parser.parseStringPromise(data);
        console.log("✅ Mapping Loaded Successfully");
    } catch (error) {
        console.error("❌ Error Loading Mapping:", error.message);
        process.exit(1);
    }
};

async function xmlMediator(xmlQuery) {
    try {
        console.log("Received XML Query:", xmlQuery); // Log the incoming query for debugging

        const jsonQuery = await parser.parseStringPromise(xmlQuery);

        if (jsonQuery.Query.MatchTeams) {
            console.log("MatchTeams query detected, calling matchTeams..."); // Log before calling matchTeams
            return await matchTeams(jsonQuery.Query.MatchTeams[0].ParticipantID[0]);
        }

        // New code for editParticipant
        if (jsonQuery.Query.EditParticipant) {
            const participantId = jsonQuery.Query.EditParticipant[0].ParticipantID[0];
            const newTeamId = jsonQuery.Query.EditParticipant[0].NewTeamID[0];
            console.log("EditParticipant query detected, calling editParticipantTeam...");
            return await editParticipantTeam(participantId, newTeamId);
        }

        // New code for deleteParticipant
        if (jsonQuery.Query.DeleteParticipant) {
            const participantId = jsonQuery.Query.DeleteParticipant[0].ParticipantID[0];
            console.log("DeleteParticipant query detected, calling deleteParticipantFromTeamAndNode...");
            return await deleteParticipantFromTeamAndNode(participantId);
        }

        if (jsonQuery.Query.GetParticipantDetails) {
            const participantId = jsonQuery.Query.GetParticipantDetails[0].ParticipantID[0];
            console.log("GetParticipantDetails query detected, calling getParticipantDetails...");
            return await getParticipantDetails(participantId);
        }
      
        return builder.buildObject({ Response: { Error: "Invalid Query" } });
    } catch (error) {
        console.error("Error parsing XML:", error.message); // Log parsing errors
        return builder.buildObject({ Response: { Error: error.message } });
    }
}


// New function to get participant details from both MongoDB and Neo4j
async function getParticipantDetails(participantId) {
    const session = driver.session(); // Neo4j session for querying the database
    let participant;

    try {
        console.log("Inside getParticipantDetails with ParticipantID:", participantId);

        // Fetch participant from MongoDB
        participant = await mongoose.connection.db.collection(participantCollection)
            .findOne({ [participantFields.id]: participantId });

        if (!participant) {
            console.log("Participant not found with ID:", participantId);
            return builder.buildObject({ Response: { Error: "Participant not found" } });
        }

        console.log("Participant found:", participant);

        // Fetch the team the participant is assigned to
        const teamResults = await session.run(
            `MATCH (p:Participant {${participantFields.id}: $participantId})-[:BELONGS_TO]->(t:Team)-[:WORKS_ON]->(pr:Project)
             RETURN t.${teamFields.teamId} AS teamId, pr.${projectFields.id} AS projectId, pr.${projectFields.requiredSkills} AS projectRequiredSkills`,
            { participantId }
        );

        if (teamResults.records.length === 0) {
            console.log("No team or project found for participant", participantId);
            return builder.buildObject({ Response: { Message: "No team or project found for participant" } });
        }

        // Get the team, project and skills
        const teamId = teamResults.records[0].get("teamId");
        const projectId = teamResults.records[0].get("projectId");
        let projectRequiredSkills = teamResults.records[0].get("projectRequiredSkills");

        if (!Array.isArray(projectRequiredSkills)) {
            projectRequiredSkills = [projectRequiredSkills];
        }
        projectRequiredSkills = projectRequiredSkills.map(skill => skill.toLowerCase());

        console.log(`Participant ${participantId} is in team ${teamId} working on project ${projectId}`);
        console.log(`Required skills for the project: ${projectRequiredSkills.join(", ")}`);

        // Prepare the XML response
        const xmlResponse = {
            Response: {
                Participant: {
                    ID: participant[participantFields.id],
                    Name: participant[participantFields.name],
                    Skills: participant[participantFields.skills].join(", "),
                    Team: {
                        ID: teamId,
                        Project: {
                            ID: projectId,
                            RequiredSkills: projectRequiredSkills.join(", ")
                        }
                    }
                }
            }
        };

        return builder.buildObject(xmlResponse);

    } catch (error) {
        console.error("Error in getParticipantDetails:", error.message);
        return builder.buildObject({ Response: { Error: error.message } });
    } finally {
        session.close(); // Close the Neo4j session
    }
}

// 
async function matchTeams(participantId) {
    const session = driver.session();
    let participant;

    try {
        console.log("Inside matchTeams with ParticipantID:", participantId);

        // Extract MongoDB and Neo4j mappings
        const participantCollection = mapping.Mapping.MongoDB[0].Collection[0].$.name;
        const participantFields = mapping.Mapping.MongoDB[0].Collection[0].Field.reduce((acc, field) => {
            acc[field.$.name] = field.$.name;
            return acc;
        }, {});

        const teamNode = mapping.Mapping.Neo4j[0].Node.find(node => node.$.label === "Team").Property;
        const teamFields = teamNode.reduce((acc, prop) => {
            acc[prop.$.name] = prop.$.name;
            return acc;
        }, {});

        const projectNode = mapping.Mapping.Neo4j[0].Node.find(node => node.$.label === "Project").Property;
        const projectFields = projectNode.reduce((acc, prop) => {
            acc[prop.$.name] = prop.$.name;
            return acc;
        }, {});

        // Fetch participant from MongoDB
        participant = await mongoose.connection.db.collection(participantCollection)
            .findOne({ [participantFields.id]: participantId });

        if (!participant) {
            console.log("Participant not found with ID:", participantId);
            return builder.buildObject({ Response: { Error: "Participant not found" } });
        }

        console.log("Participant found:", participant);

        // Fetch teams with available slots from Neo4j
        const teamResults = await session.run(
            `MATCH (t:Team)-[:WORKS_ON]->(p:Project)
             OPTIONAL MATCH (t)<-[:BELONGS_TO]-(participant:Participant)
             WITH t, p, COUNT(participant) AS currentTeamSize, t.${teamFields.teamSize} AS maxSize
             WHERE currentTeamSize < toInteger(maxSize)
             RETURN DISTINCT 
                    t.${teamFields.teamId} AS teamId, 
                    t.${teamFields.teamName} AS teamName, 
                    p.${projectFields.id} AS projectId,  
                    p.${projectFields.name} AS projectName, 
                    p.${projectFields.requiredSkills} AS requiredSkills`
        );

        let bestMatchedTeam = null;
        let maxMatchingSkills = 0;
        let matchedSkillsList = [];

        // Normalize participant skills
        const participantSkills = participant[participantFields.skills].map(skill => skill.toLowerCase());

        for (let record of teamResults.records) {
            const teamId = record.get("teamId");
            const teamName = record.get("teamName");
            const projectId = record.get("projectId");
            const projectName = record.get("projectName");
            let requiredSkills = record.get("requiredSkills");

            if (!Array.isArray(requiredSkills)) {
                requiredSkills = [requiredSkills];
            }
            requiredSkills = requiredSkills.map(skill => skill.toLowerCase());

            console.log(`Checking team: ${teamName} | Required Skills: ${requiredSkills}`);

            // Count matching skills and store them
            const matchingSkills = requiredSkills.filter(skill => participantSkills.includes(skill));
            const matchingSkillsCount = matchingSkills.length;

            console.log(`Team ${teamName} | Matches Found: ${matchingSkillsCount}`);

            // Select the team with the most matching skills
            if (matchingSkillsCount >= 2 && matchingSkillsCount > maxMatchingSkills) {
                maxMatchingSkills = matchingSkillsCount;
                matchedSkillsList = matchingSkills;
                bestMatchedTeam = { teamId, teamName, projectId, projectName, requiredSkills };
            }
        }

        if (!bestMatchedTeam) {
            console.log("No matching team found for participant", participantId);
            return builder.buildObject({ Response: { Message: "No matching team found for participant" } });
        }

        // ✅ Remove previous assignment if exists
        await session.run(
            `MATCH (p:Participant {${participantFields.id}: $participantId})-[r:BELONGS_TO]->(t:Team)
             DELETE r`,
            { participantId }
        );

        // ✅ Assign participant to team
        await mongoose.connection.db.collection(participantCollection).updateOne(
            { [participantFields.id]: participantId },
            { $set: { [participantFields.assigned_team]: bestMatchedTeam.teamId } }
        );

        // ✅ Update Neo4j relationship
        await session.run(
            `MATCH (t:Team {${teamFields.teamId}: $teamId})
             MERGE (p:Participant {${participantFields.id}: $participantId})
             MERGE (p)-[:BELONGS_TO]->(t)`,
            { teamId: bestMatchedTeam.teamId, participantId }
        );

        console.log(`Participant ${participantId} assigned to team ${bestMatchedTeam.teamName}`);

        // Prepare XML response
        const xmlResponse = {
            Response: {
                MatchedTeam: {
                    ID: bestMatchedTeam.teamId,
                    Name: bestMatchedTeam.teamName,
                    Project: {
                        ID: bestMatchedTeam.projectId,
                        Name: bestMatchedTeam.projectName,
                        RequiredSkills: bestMatchedTeam.requiredSkills.join(", "), // Required skills of the project
                    },
                    MatchedSkills: {
                        Count: maxMatchingSkills, // Number of matched skills
                        Skills: matchedSkillsList.join(", "), // Matched skills
                    },
                    Participant: {
                        ID: participant[participantFields.id],
                        Name: participant[participantFields.name],
                        Skills: participant[participantFields.skills].join(", "),
                    },
                },
            },
        };

        return builder.buildObject(xmlResponse);
    } catch (error) {
        console.error("Error in matchTeams:", error.message);
        return builder.buildObject({ Response: { Error: error.message } });
    } finally {
        session.close();
    }
}


// Declare shared variables to store mappings
let participantCollection = null;
let participantFields = null;
let teamFields = null;
let projectFields = null;

// Load Mapping and Initialize Shared Variables
const initializeMappingVariables = () => {
    // Extract MongoDB and Neo4j mappings
    participantCollection = mapping.Mapping.MongoDB[0].Collection[0].$.name;
    participantFields = mapping.Mapping.MongoDB[0].Collection[0].Field.reduce((acc, field) => {
        acc[field.$.name] = field.$.name;
        return acc;
    }, {});

    const teamNode = mapping.Mapping.Neo4j[0].Node.find(node => node.$.label === "Team").Property;
    teamFields = teamNode.reduce((acc, prop) => {
        acc[prop.$.name] = prop.$.name;
        return acc;
    }, {});

    const projectNode = mapping.Mapping.Neo4j[0].Node.find(node => node.$.label === "Project").Property;
    projectFields = projectNode.reduce((acc, prop) => {
        acc[prop.$.name] = prop.$.name;
        return acc;
    }, {});

    console.log("✅ Mapping Variables Initialized");
};

// Initialize variables after loading mapping
loadMapping().then(() => {
    initializeMappingVariables();
});

// Main Function to Edit Participant's Team
async function editParticipantTeam(participantId, newTeamId) {
    const session = driver.session(); // Neo4j session for querying and updating the database
    let participant;

    try {
        console.log("Inside editParticipantTeam with ParticipantID:", participantId);

        // Fetch participant from MongoDB (using the 'participantCollection' and 'participantFields' variables)
        participant = await mongoose.connection.db.collection(participantCollection)
            .findOne({ [participantFields.id]: participantId });

        if (!participant) {
            console.log("Participant not found with ID:", participantId);
            return builder.buildObject({ Response: { Error: "Participant not found" } });
        }

        console.log("Participant found:", participant);

        // Fetch the new team and check if it has space
        const teamResults = await session.run(
            `MATCH (t:Team {${teamFields.teamId}: $newTeamId})
             OPTIONAL MATCH (t)<-[:BELONGS_TO]-(p:Participant)
             WITH t, COUNT(p) AS currentTeamSize, t.${teamFields.teamSize} AS maxSize
             WHERE currentTeamSize < toInteger(maxSize)
             RETURN t.${teamFields.teamId} AS teamId, t.${teamFields.teamName} AS teamName`,
            { newTeamId }
        );

        if (teamResults.records.length === 0) {
            console.log("New team is full or doesn't exist.");
            return builder.buildObject({ Response: { Message: "Team is full or doesn't exist" } });
        }

        // ✅ Remove previous team assignment if exists
        await session.run(
            `MATCH (p:Participant {${participantFields.id}: $participantId})-[r:BELONGS_TO]->(t:Team)
             DELETE r`,
            { participantId }
        );

        // ✅ Update MongoDB with new team
        await mongoose.connection.db.collection(participantCollection).updateOne(
            { [participantFields.id]: participantId },
            { $set: { [participantFields.assigned_team]: newTeamId } }
        );

        // ✅ Update Neo4j relationship
        await session.run(
            `MATCH (t:Team {${teamFields.teamId}: $newTeamId})
             MERGE (p:Participant {${participantFields.id}: $participantId})
             MERGE (p)-[:BELONGS_TO]->(t)`,
            { newTeamId, participantId }
        );

        console.log(`Participant ${participantId} moved to team ${newTeamId}`);

        // Prepare the XML response
        const xmlResponse = {
            Response: {
                Message: `Participant ${participantId} successfully moved to team ${newTeamId}`,
            },
        };

        return builder.buildObject(xmlResponse);

    } catch (error) {
        console.error("Error in editParticipantTeam:", error.message);
        return builder.buildObject({ Response: { Error: error.message } });
    } finally {
        session.close(); // Close the Neo4j session
    }
}

async function deleteParticipantFromTeamAndNode(participantId) {
    const session = driver.session();
    let participant;

    try {
        console.log("Inside deleteParticipantFromTeamAndNode with ParticipantID:", participantId);

        // Fetch participant from MongoDB
        participant = await mongoose.connection.db.collection(participantCollection)
            .findOne({ [participantFields.id]: participantId });

        if (!participant) {
            console.log("Participant not found with ID:", participantId);
            return builder.buildObject({ Response: { Error: "Participant not found" } });
        }

        console.log("Participant found:", participant);

        // Remove the participant’s relationship with the team in Neo4j
        await session.run(
            `MATCH (p:Participant {${participantFields.id}: $participantId})-[r:BELONGS_TO]->(t:Team)
             DELETE r`,
            { participantId }
        );

        // Remove the participant node in Neo4j
        await session.run(
            `MATCH (p:Participant {${participantFields.id}: $participantId})
             DELETE p`,
            { participantId }
        );

        // Update MongoDB to nullify the team assignment
        await mongoose.connection.db.collection(participantCollection).updateOne(
            { [participantFields.id]: participantId },
            { $set: { [participantFields.assigned_team]: null } }
        );

        console.log(`Participant ${participantId} removed from their team and deleted from Neo4j`);

        // Prepare the XML response
        const xmlResponse = {
            Response: {
                Message: `Participant ${participantId} successfully removed from their team and deleted from Neo4j`,
            },
        };

        return builder.buildObject(xmlResponse);

    } catch (error) {
        console.error("Error in deleteParticipantFromTeamAndNode:", error.message);
        return builder.buildObject({ Response: { Error: error.message } });
    } finally {
        session.close();
    }
}


// ✅ Load Mapping on Startup
loadMapping();

module.exports = xmlMediator;










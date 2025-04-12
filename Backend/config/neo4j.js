// const neo4j = require("neo4j-driver");
// require("dotenv").config();

// const connectNeo4j = async () => {
//   try {
//     const driver = neo4j.driver(
//       process.env.NEO4J_URI, 
//       neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
//     );
//     await driver.verifyConnectivity();
//     console.log("✅ Neo4j Connected");
//     return driver;
//   } catch (err) {
//     console.error("❌ Neo4j Connection Failed:", err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectNeo4j;


// const neo4j = require("neo4j-driver");
// require("dotenv").config();

// const driver = neo4j.driver(
//     process.env.NEO4J_URI,
//     neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
// );

// const connectNeo4j = async () => {
//     try {
//         const session = driver.session();
//         await session.run("RETURN 1"); // ✅ Test query to check connection
//         console.log("✅ Connected to Neo4j");
//         session.close();
//     } catch (error) {
//         console.error("❌ Neo4j Connection Failed:", error.message);
//         process.exit(1);
//     }
// };

// const getSession = () => driver.session(); // ✅ Function to get a new session when needed

// module.exports = { connectNeo4j, getSession };



const neo4j = require("neo4j-driver");
require("dotenv").config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
    {
        routing:false
    }
);

const connectNeo4j = async () => {
    try {
        const session = driver.session();
        await session.run("RETURN 1"); // ✅ Test query to check connection
        console.log("✅ Connected to Neo4j");
        session.close();
        return driver; // Return the driver instance
    } catch (error) {
        console.error("❌ Neo4j Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = { connectNeo4j, driver }; // Export driver as well

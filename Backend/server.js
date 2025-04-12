// // const express = require('express');
// // const cors = require('cors');
// // require('dotenv').config();

// // const connectMongoDB = require('./config/mongo');
// // const connectNeo4j = require('./config/neo4j');

// // const app = express();

// // app.use(cors());
// // app.use(express.json());

// // // ✅ Connect Databases
// // connectMongoDB();
// // connectNeo4j();

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// const express = require('express');
// const bodyParser = require("body-parser");
// const cors = require('cors');
// require('dotenv').config();

// const connectMongoDB  = require('./config/mongo');
// const connectNeo4j  = require('./config/neo4j');

// const participantRoutes = require('./routes/participantRoute');
// const projectRoutes = require('./routes/projectRoute');
// const teamRoutes = require('./routes/teamRoute');
// // const teamParticipantRoutes = require("./routes/teamParticipantRoute");
// const xmlRoutes = require("./routes/xmlRoute");

// const app = express();

// app.use(cors());
// app.use(express.json());

// // ✅ Connect Databases
// connectMongoDB();
// connectNeo4j();

// // ✅ Routes
// app.use('/api/participants', participantRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/teams',teamRoutes);
// // app.use("/api/team-participants", teamParticipantRoutes);
// app.use(bodyParser.text({ type: "application/xml" })); // Handle XML input
// app.use("/xml-api", xmlRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// require("dotenv").config();

// const connectMongoDB = require("./config/mongo");
// const {connectNeo4j} = require("./config/neo4j");

// const participantRoutes = require("./routes/participantRoute");
// const projectRoutes = require("./routes/projectRoute");
// const teamRoutes = require("./routes/teamRoute");
// const xmlRoutes = require("./routes/xmlRoute");

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.text({ type: "application/xml" })); // ✅ Ensure XML handling before routes

// // ✅ Connect Databases
// connectMongoDB();
// connectNeo4j();

// // ✅ Routes
// app.use("/api/participants", participantRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/teams", teamRoutes);
// app.use("/xml-api", xmlRoutes); // ✅ Ensure this comes after bodyParser for XML

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const connectMongoDB = require('./config/mongo');
const { connectNeo4j } = require('./config/neo4j');

const participantRoutes = require('./routes/participantRoute');
const projectRoutes = require('./routes/projectRoute');
const teamRoutes = require('./routes/teamRoute');
const fetchRoutes = require("./routes/fetchRoutes");
const xmlRoutes = require("./routes/xmlRoute");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.text({ type: "application/xml" })); // ✅ Ensure XML handling before routes

// ✅ Connect Databases
connectMongoDB();
connectNeo4j(); // This is just ensuring connection and driver initialization

// ✅ Routes
app.use('/api/participants', participantRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/xml-api', xmlRoutes); // ✅ Ensure this comes after bodyParser for XML
app.use("/api", fetchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

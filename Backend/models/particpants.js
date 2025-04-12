const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    skills: [String],
    experience: Number,
    assigned_team: { type: String, default: null }  // Relates to a team in Neo4j
});

module.exports = mongoose.model('Participant', ParticipantSchema);

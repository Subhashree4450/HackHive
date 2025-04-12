import React, { useState } from "react";
import axios from "axios";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import "./MatchTeams.css"; // Import styles

const parser = new XMLParser();
const builder = new XMLBuilder();

function MatchTeams() {
    const [participantId, setParticipantId] = useState("");
    const [participantDetails, setParticipantDetails] = useState(null);
    const [matchedTeam, setMatchedTeam] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [newTeamId, setNewTeamId] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // Track delete operation

    const handleGetParticipantDetails = async () => {
        setParticipantDetails(null);
        setError("");
        setMessage("");

        const requestXml = builder.build({
            Query: { GetParticipantDetails: [{ ParticipantID: [participantId] }] },
        });

        try {
            const response = await axios.post("http://localhost:5000/xml-api", requestXml, {
                headers: { "Content-Type": "application/xml" },
            });

            const jsonResponse = parser.parse(response.data);
            console.log("Participant Details Response:", jsonResponse); // Debugging line
            if (jsonResponse.Response.Participant) {
                setParticipantDetails(jsonResponse.Response.Participant);
            } else {
                setError("Participant not found.");
            }
        } catch (err) {
            setError("Error retrieving participant details.");
            console.error(err);
        }
    };

    const handleMatchTeam = async () => {
        setMatchedTeam(null);
        setError("");
        setMessage("");
    
        const requestXml = builder.build({
            Query: { MatchTeams: [{ ParticipantID: [participantId] }] },
        });
    
        try {
            const response = await axios.post("http://localhost:5000/xml-api", requestXml, {
                headers: { "Content-Type": "application/xml" },
            });
    
            const jsonResponse = parser.parse(response.data);
            console.log("Matched Team Response:", jsonResponse); // Debugging line
    
            if (jsonResponse.Response.MatchedTeam) {
                const team = jsonResponse.Response.MatchedTeam;
    
                const participantSkills = team.Participant.Skills?.split(/,\s*/) || [];
    
                setMatchedTeam({
                    ...team,
                    participantSkills,
                });
            } else {
                setMatchedTeam(null); // Clear any previous match
                setError("No matching team found.");
            }
        } catch (err) {
            setError("Error matching participant to a team.");
            console.error(err);
        }
    };
    
    const handleEditParticipantTeam = async () => {
        setError("");
        setMessage("");
    
        const requestXml = builder.build({
            Query: {
                EditParticipant: [{ ParticipantID: [participantId], NewTeamID: [newTeamId] }],
            },
        });
    
        try {
            const response = await axios.post("http://localhost:5000/xml-api", requestXml, {
                headers: { "Content-Type": "application/xml" },
            });
    
            const jsonResponse = parser.parse(response.data);
            console.log("EditParticipant Response:", jsonResponse); // Debugging line
    
            // Success can be a message like: Participant P6 successfully moved to team T1
            if (jsonResponse.Response.Message) {
                setShowEditModal(false);
                setMessage(jsonResponse.Response.Message);
    
                // Refresh participant and match info
                await handleGetParticipantDetails();
            } else {
                setError(jsonResponse.Response.Error || "Failed to update team.");
            }
        } catch (err) {
            setError("Error updating participant team.");
            console.error(err);
        }
    };
    

    const handleDeleteParticipant = async () => {
      setIsDeleting(true); // Start delete operation

      const requestXml = builder.build({
          Query: { DeleteParticipant: [{ ParticipantID: [participantId] }] },
      });

      try {
          const response = await axios.post("http://localhost:5000/xml-api", requestXml, {
              headers: { "Content-Type": "application/xml" },
          });

          // Parse the XML response
          const jsonResponse = parser.parse(response.data);
          console.log("Delete Response:", jsonResponse); // Debugging line

          // Check if the response contains the Message field
          if (jsonResponse.Response && jsonResponse.Response.Message) {
              const message = jsonResponse.Response.Message;

              // If successful deletion message is returned
              if (message.includes("successfully removed")) {
                  setIsDeleting(false); // Stop delete operation
                  setShowDeleteModal(false); // Close modal on success
                  setMessage(message); // Display success message
                  setParticipantDetails(null); // Reset participant details
              } else {
                  // Handle failure case
                  setIsDeleting(false); // Stop delete operation
                  setError(message || "Failed to delete participant.");
              }
          } else {
              setIsDeleting(false); // Stop delete operation
              setError("Unexpected response format.");
          }
      } catch (err) {
          setIsDeleting(false); // Stop delete operation
          setError("Error deleting participant.");
          console.error(err);
      }
  };
  
    return (
        <div className="container">
            <h1>Participant Management</h1>

            <div>
                <label>Participant ID:</label>
                <input
                    type="text"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    placeholder="Enter Participant ID"
                    required
                />
                <button onClick={handleGetParticipantDetails}>Get Details</button>
                <button onClick={() => setShowEditModal(true)}>Edit Team</button>
                    <button onClick={handleMatchTeam}>Match Team</button> {/* Added Match Team button */}
                    <button onClick={() => setShowDeleteModal(true)}>Delete</button>
            </div>

            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            {participantDetails && (
                <div className="card">
                    <h2>Participant Details</h2>
                    <p><strong>ID:</strong> {participantDetails.ID}</p>
                    <p><strong>Name:</strong> {participantDetails.Name}</p>
                    <p><strong>Skills:</strong> {participantDetails.Skills}</p>
                    {participantDetails.Team ? (
                        <>
                            <p><strong>Team ID:</strong> {participantDetails.Team.ID}</p>
                            <p><strong>Project:</strong> {participantDetails.Team.Project.ID}</p>
                        </>
                    ) : (
                        <p>No assigned team</p>
                    )}
                </div>
            )}

            {matchedTeam && (
                <div className="card">
                    <h2>Matched Team</h2>
                    <p><strong>Team Name:</strong> {matchedTeam.Name}</p>
                    <p><strong>Project Name:</strong> {matchedTeam.Project?.Name}</p>
                    <p><strong>Required Skills:</strong> {matchedTeam.Project?.RequiredSkills}</p>
                    <p><strong>Participant's Skills:</strong> {matchedTeam.participantSkills?.join(", ")}</p>
                </div>
            )}


            {showEditModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Edit Participant Team</h3>
                        <input
                            type="text"
                            placeholder="Enter new team ID"
                            value={newTeamId}
                            onChange={(e) => setNewTeamId(e.target.value)}
                        />
                        <button onClick={handleEditParticipantTeam}>Save</button>
                        <button onClick={() => setShowEditModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>Are you sure you want to delete this participant?</p>
                        <button onClick={handleDeleteParticipant} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Yes"}
                        </button>
                        <button onClick={() => setShowDeleteModal(false)}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MatchTeams;

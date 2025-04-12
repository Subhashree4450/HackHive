// import React from "react";
// import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
// import Home from "./pages/Home/Home";
// import Participants from "./pages/Participants/Participants";
// import ProjectTeam from "./pages/ProjectTeam/ProjectTeam";
// import MatchTeams from "./pages/MatchTeams/MatchTeams";


// function App() {
//   return (
//     <Router>
//       <div className="navbar">
//         <Link to="/">Home</Link>
//         <Link to="/participants">Participants</Link>
//         <Link to="/projects-teams">Projects & Teams</Link>
//         <Link to="/match-teams">Projects & Teams</Link>
//       </div>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/participants" element={<Participants />} />
//         <Route path="/projects-teams" element={<ProjectTeam />} />
//         <Route path="/match-teams" element={<MatchTeams />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home/Home";
import Participants from "./pages/Participants/Participants";
import ProjectTeam from "./pages/ProjectTeam/ProjectTeam";
import MatchTeams from "./pages/MatchTeams/MatchTeams";
import FetchData from "./pages/FetchData/FetchData";

import "./App.css"; // Import the CSS file

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="logo">HackHive</Link>
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/participants" onClick={() => setMenuOpen(false)}>Participants</Link>
          <Link to="/projects-teams" onClick={() => setMenuOpen(false)}>Projects & Teams</Link>
          <Link to="/match-teams" onClick={() => setMenuOpen(false)}>Match Teams</Link>
          <Link to="/fetchData" onClick={() => setMenuOpen(false)}>FetchData</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/participants" element={<Participants />} />
        <Route path="/projects-teams" element={<ProjectTeam />} />
        <Route path="/match-teams" element={<MatchTeams />} />
        <Route path="/fetchData" element={<FetchData/>} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="page-container">
      <h2>Stadium Dashboard (Home)</h2>
      <p>Welcome to the Matchday Command Center. Select a mode or section from the navigation to begin.</p>
      
      <div className="card">
        <h3>Simulated Matchday Overview</h3>
        <p>This is a simulated prototype for demonstrating GenAI-driven stadium operations and fan guidance during high-pressure tournament match days.</p>
        <ul>
          <li><strong>Current Match:</strong> Group A - Match 12</li>
          <li><strong>Simulated Venue:</strong> MetLife Stadium (East Rutherford, NJ)</li>
          <li><strong>Attendance:</strong> 82,500 (Simulated)</li>
          <li><strong>System Status:</strong> Operational (Simulated)</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;

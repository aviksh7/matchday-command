import React from 'react';

export const StaffCommand: React.FC = () => {
  return (
    <div className="page-container">
      <h2>Staff Command Dashboard</h2>
      <p>Simulated stadium operations control center, wait times, gate pressure, and crowd density alerts.</p>
      
      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
        <div className="card" style={{ borderLeft: '4px solid #f44336' }}>
          <h4>Gate Pressure (Simulated)</h4>
          <p><strong>Gate A:</strong> High (85%)</p>
          <p><strong>Gate B:</strong> Moderate (45%)</p>
          <p><strong>Gate C:</strong> Low (20%)</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #ffeb3b' }}>
          <h4>Wait Times (Simulated)</h4>
          <p><strong>Concessions (Sec 102):</strong> 15 mins</p>
          <p><strong>Restrooms (Sec 114):</strong> 8 mins</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #2196f3' }}>
          <h4>Accessibility Requests</h4>
          <p>Active requests: 3</p>
        </div>
      </div>
    </div>
  );
};

export default StaffCommand;

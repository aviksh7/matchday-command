import React from 'react';

export const IncidentSupport: React.FC = () => {
  return (
    <div className="page-container">
      <h2>Incident Support & Action Plans</h2>
      <p>Simulated incident log queue with GenAI-generated incident response action plans.</p>
      
      <div className="card">
        <h3>Active Incident Queue (Simulated)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Type</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Location</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Severity</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>#001</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Crowd bottleneck</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Gate A Exit Ramp</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><span style={{ color: 'red' }}>High</span></td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Drafting Action Plan...</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>#002</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Spill hazard</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Concourse Sec 108</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><span style={{ color: 'orange' }}>Medium</span></td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Assigned (Volunteers)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentSupport;

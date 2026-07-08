import React from 'react';

export const FanAssistant: React.FC = () => {
  return (
    <div className="page-container">
      <h2>Fan Assistant</h2>
      <p>Multilingual guidance, navigation, accessibility, and sustainability tips for stadium visitors.</p>
      
      <div className="card">
        <h3>Ask the Matchday Fan Assistant (Simulated)</h3>
        <p style={{ color: '#666', fontStyle: 'italic' }}>AI Chatbot and support interface placeholder. In the next milestone, this will handle multilingual queries and real-time guidance.</p>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', margin: '1rem 0' }}>
          <p><strong>Suggested Prompts:</strong></p>
          <ul>
            <li>"Where is the nearest accessible restroom to Gate C?"</li>
            <li>"How do I take transit back to city center?"</li>
            <li>"What are the stadium recycling policies?"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FanAssistant;

import React, { useState, useEffect, useRef } from 'react';
import { SIMULATED_VENUES } from '../data/mockData';
import { getSimulatedAssistantResponse } from '../logic/fanAssistant';
import type { AssistantPromptKey } from '../logic/fanAssistant';
import type { AssistantResponse } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  responseData?: AssistantResponse;
  timestamp: string;
}

export const FanAssistant: React.FC = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(SIMULATED_VENUES[0].id);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  
  const selectedVenue = SIMULATED_VENUES.find(v => v.id === selectedVenueId) || SIMULATED_VENUES[0];
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat with a greeting when active venue changes
  useEffect(() => {
    const greeting: Message = {
      id: 'greeting',
      sender: 'assistant',
      text: `Hello! I am the Matchday Fan Assistant prototype for the **${selectedVenue.name}** console.

Click one of the quick action prompts below or enter a custom question to see simulated stadium operations guidance. Note: This interface is Gemini-ready and is planned for server-side Generative AI integration in a future milestone.`,
      timestamp: getCurrentTimestamp()
    };
    setChatHistory([greeting]);
  }, [selectedVenueId]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0].substring(0, 5);
  };

  const handlePromptClick = (key: AssistantPromptKey, label: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: label,
      timestamp: getCurrentTimestamp()
    };

    const responseData = getSimulatedAssistantResponse(key, null, selectedVenue);

    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      sender: 'assistant',
      responseData,
      timestamp: getCurrentTimestamp()
    };

    setChatHistory(prev => [...prev, userMsg, assistantMsg]);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue.trim(),
      timestamp: getCurrentTimestamp()
    };

    const responseData = getSimulatedAssistantResponse('custom', inputValue.trim(), selectedVenue);

    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      sender: 'assistant',
      responseData,
      timestamp: getCurrentTimestamp()
    };

    setChatHistory(prev => [...prev, userMsg, assistantMsg]);
    setInputValue('');
  };

  return (
    <div className="page-container">
      {/* Top Banner Disclaimer */}
      <div className="card venue-selector-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <label htmlFor="assistant-venue-select" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Active Stadium Console:</label>
            <select 
              id="assistant-venue-select" 
              value={selectedVenueId} 
              onChange={(e) => setSelectedVenueId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' }}
            >
              {SIMULATED_VENUES.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.name} ({venue.locationName})</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 350px', fontSize: '0.85rem', color: '#475569', background: '#ffffff', padding: '0.75rem 1.0rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <strong>Safety &amp; Simulation Warning:</strong> {selectedVenue.simulationDisclaimer}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start', flexWrap: 'wrap' }} className="assistant-layout">
        
        {/* Chat Interface Column */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          
          {/* Assistant Header */}
          <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Fan Operations Assistant</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>⚡ LOCAL SIMULATED PROTOTYPE (GEMINI INTEGRATION PLANNED)</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Console: <strong>{selectedVenue.name}</strong></div>
          </div>

          {/* Messages Scroll Area */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chatHistory.map(msg => (
              <div 
                key={msg.id}
                style={{ 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {msg.sender === 'user' ? (
                  /* User Message Box */
                  <div style={{ padding: '0.75rem 1.25rem', background: 'var(--primary-color)', color: 'white', borderRadius: '18px 18px 2px 18px', fontSize: '0.95rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {msg.text}
                  </div>
                ) : (
                  /* Assistant Message Box */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {msg.text ? (
                      /* Plain text greeting/system message */
                      <div style={{ padding: '1rem 1.25rem', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '18px 18px 18px 2px', fontSize: '0.95rem', color: 'var(--text-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        {msg.text}
                      </div>
                    ) : msg.responseData ? (
                      /* Structured Telemetry Response Card */
                      <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 5px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '600px' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Assistant Answer</strong>
                          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-color)', fontWeight: 500 }}>{msg.responseData.answer}</p>
                        </div>

                        <div style={{ padding: '0.65rem 0.85rem', background: 'var(--normal-bg)', borderLeft: '4px solid var(--normal-color)', borderRadius: '0 6px 6px 0', fontSize: '0.85rem' }}>
                          <strong style={{ display: 'block', color: 'var(--normal-color)', fontWeight: 'bold', marginBottom: '0.15rem' }}>Recommended Action:</strong>
                          <span style={{ color: 'var(--text-color)' }}>{msg.responseData.action}</span>
                        </div>

                        <div style={{ padding: '0.5rem 0.75rem', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.8rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                          <strong style={{ display: 'block', color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Telemetry Grounding Data used:</strong>
                          <code>{msg.responseData.telemetryUsed}</code>
                        </div>

                        <div style={{ fontSize: '0.7rem', color: '#b06000', background: '#fff8e1', border: '1px solid #ffe082', padding: '0.35rem 0.5rem', borderRadius: '4px', textAlign: 'center' }}>
                          ⚠️ {msg.responseData.disclaimer}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem', padding: '0 0.5rem' }}>{msg.timestamp}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Area */}
          <form onSubmit={handleCustomSubmit} style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about gates, concession wait times, transit, accessibility, or sustainability..."
              style={{ 
                flex: 1, 
                padding: '0.75rem 1rem', 
                border: '1px solid #cbd5e1', 
                borderRadius: '6px', 
                fontSize: '0.95rem'
              }}
            />
            <button 
              type="submit" 
              style={{ 
                background: 'var(--primary-color)', 
                color: 'white', 
                border: 'none', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '6px', 
                fontSize: '0.95rem', 
                fontWeight: 'bold', 
                cursor: 'pointer' 
              }}
            >
              Send
            </button>
          </form>

        </div>

        {/* Quick Action Prompt List Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>Quick Guidance Prompts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button 
                onClick={() => handlePromptClick('least-crowded-gate', 'Find the least crowded gate')}
                style={{ textAlign: 'left', padding: '0.6rem 0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                🔍 Find the least crowded gate
              </button>
              <button 
                onClick={() => handlePromptClick('low-wait-concessions', 'Find lower-wait restroom/concession area')}
                style={{ textAlign: 'left', padding: '0.6rem 0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                🍔 Find lowest queue concession
              </button>
              <button 
                onClick={() => handlePromptClick('accessible-guidance', 'Get accessible route guidance')}
                style={{ textAlign: 'left', padding: '0.6rem 0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                ♿ Get accessibility guidance
              </button>
              <button 
                onClick={() => handlePromptClick('transit-pressures', 'Get post-match transit guidance')}
                style={{ textAlign: 'left', padding: '0.6rem 0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                🚆 Get transit pressures status
              </button>
              <button 
                onClick={() => handlePromptClick('sustainability-tips', 'Get sustainability tip')}
                style={{ textAlign: 'left', padding: '0.6rem 0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                🌱 Get sustainability tips
              </button>
              <button 
                onClick={() => handlePromptClick('translate-announcement', 'Translate announcement placeholder')}
                style={{ textAlign: 'left', padding: '0.6rem 0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                📢 Translate PA announcements
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 0 }}>
            <strong style={{ display: 'block', color: 'var(--text-color)', marginBottom: '0.25rem' }}>Simulation Stance Disclaimer</strong>
            This assistant prototype uses only simulated crowd telemetry and mock venue status data. It does not connect to real FIFA databases, ticketing gateways, emergency medical dispatch, or live public transit feeds.
          </div>

        </div>

      </div>
    </div>
  );
};

export default FanAssistant;

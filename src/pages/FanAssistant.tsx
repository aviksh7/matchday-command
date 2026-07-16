import React, { useState, useEffect, useRef } from 'react';
import { SIMULATED_VENUES } from '../data/mockData';
import { getSimulatedAssistantResponse } from '../logic/fanAssistant';
import type { AssistantPromptKey } from '../logic/fanAssistant';
import type { AssistantResponse } from '../types';
import { postFanAssistant } from '../logic/apiClient';
import type { ResponseSource } from '../logic/apiClient';
import Icon, { type IconName } from '../components/Icon';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  responseData?: AssistantResponse;
  source?: ResponseSource;
  fallbackReasonText?: string;
  timestamp: string;
}

const QUICK_COMMANDS: Array<{
  key: AssistantPromptKey;
  query: string;
  label: string;
  icon: IconName;
}> = [
  { key: 'least-crowded-gate', query: 'Find the least crowded gate', label: 'Find the least crowded gate', icon: 'map' },
  { key: 'low-wait-concessions', query: 'Find lower-wait restroom/concession area', label: 'Find lowest queue concession', icon: 'route' },
  { key: 'accessible-guidance', query: 'Get accessible route guidance', label: 'Get accessibility guidance', icon: 'accessibility' },
  { key: 'transit-pressures', query: 'Get post-match transit guidance', label: 'Get transit pressures status', icon: 'train' },
  { key: 'sustainability-tips', query: 'Get sustainability tip', label: 'Get sustainability tips', icon: 'water' },
  { key: 'translate-announcement', query: 'Translate announcement placeholder', label: 'Translate PA announcements', icon: 'assistant' },
];

const renderEmphasis = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const emphasisPattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = emphasisPattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    nodes.push(<strong key={`${match.index}-${match[1]}`}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
};

export const FanAssistant: React.FC = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(SIMULATED_VENUES[0].id);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const selectedVenue = SIMULATED_VENUES.find(v => v.id === selectedVenueId) || SIMULATED_VENUES[0];
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const currentVenueIdRef = useRef<string>(selectedVenueId);

  // Initialize chat with a greeting when active venue changes and abort any active request
  useEffect(() => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }
    setIsLoading(false);
    currentVenueIdRef.current = selectedVenueId;

    const greeting: Message = {
      id: 'greeting',
      sender: 'assistant',
      text: `Hello! This is the Matchday Fan Assistant prototype for the ${selectedVenue.name} console.\n\nUse a quick command or ask a custom question. Guidance uses Vertex AI through Cloud Run when available, with a deterministic local fallback when offline or on error.`,
      timestamp: getCurrentTimestamp()
    };
    setChatHistory([greeting]);
  }, [selectedVenueId, selectedVenue.name]);

  // Clean up any pending request on unmount
  useEffect(() => {
    return () => {
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
    };
  }, []);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0].substring(0, 5);
  };

  const executeFanQuery = async (queryText: string, promptKey: AssistantPromptKey | 'custom') => {
    if (isLoading) return;

    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }
    const controller = new AbortController();
    activeRequestRef.current = controller;
    const requestVenueId = selectedVenue.id;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: getCurrentTimestamp()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await postFanAssistant(queryText, selectedVenue, controller.signal);

      // If venue changed while fetching or controller aborted by unmount/venue switch, ignore stale result
      if (controller.signal.aborted || currentVenueIdRef.current !== requestVenueId) {
        return;
      }

      if (result.success) {
        const responseData: AssistantResponse = {
          answer: result.data.summary,
          action: result.data.recommendedAction,
          telemetryUsed: result.data.simulatedDataUsed.join(', '),
          disclaimer: result.data.limitations
        };
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          responseData,
          source: result.source,
          timestamp: getCurrentTimestamp()
        };
        setChatHistory(prev => [...prev, assistantMsg]);
      } else {
        const fallbackResponse = getSimulatedAssistantResponse(promptKey, queryText, selectedVenue);
        const fallbackReasonText = result.message || 'Switched to local deterministic fallback due to network or server error.';

        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          responseData: fallbackResponse,
          source: result.source,
          fallbackReasonText,
          timestamp: getCurrentTimestamp()
        };
        setChatHistory(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      if (controller.signal.aborted || currentVenueIdRef.current !== requestVenueId) {
        return;
      }
      const fallbackResponse = getSimulatedAssistantResponse(promptKey, queryText, selectedVenue);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        responseData: fallbackResponse,
        source: 'Local deterministic fallback',
        fallbackReasonText: 'Network connection failure. Switched to local deterministic fallback.',
        timestamp: getCurrentTimestamp()
      };
      setChatHistory(prev => [...prev, assistantMsg]);
    } finally {
      if (activeRequestRef.current === controller) {
        setIsLoading(false);
        activeRequestRef.current = null;
      }
    }
  };

  const handlePromptClick = (key: AssistantPromptKey, label: string) => {
    if (isLoading) return;
    executeFanQuery(label, key);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const queryText = inputValue.trim();
    setInputValue('');
    executeFanQuery(queryText, 'custom');
  };

  return (
    <div className="page-container fan-assistant-page">
      <section className="fan-console-toolbar" aria-label="Fan Assistant console controls">
        <div className="fan-console-toolbar__venue">
          <label htmlFor="assistant-venue-select">
            <span aria-hidden="true">ACTIVE CONSOLE</span>
            <span className="sr-only">Active Stadium Console:</span>
          </label>
          <select
            className="mc-select fan-console-toolbar__select"
            id="assistant-venue-select"
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            disabled={isLoading}
          >
            {SIMULATED_VENUES.map(venue => (
              <option key={venue.id} value={venue.id}>{venue.name} ({venue.locationName})</option>
            ))}
          </select>
        </div>
        <span className="fan-console-toolbar__capability"><span aria-hidden="true" />AI GUIDANCE ENABLED</span>
      </section>

      <section className="fan-workspace" aria-label="Fan Operations Assistant workspace">
        <div className="fan-chat">
          <header className="fan-chat__header">
            <div>
              <span className="fan-chat__eyebrow"><Icon name="spark" size={14} />Hybrid guidance workspace</span>
              <h2>Fan Operations Assistant</h2>
            </div>
            <div className="fan-chat__venue">Console <strong>{selectedVenue.name}</strong></div>
          </header>

          <div className="fan-chat__messages">
            {chatHistory.map(msg => (
              <article key={msg.id} className={`fan-message fan-message--${msg.sender}`}>
                {msg.sender === 'user' ? (
                  <div className="fan-message__user-bubble">{msg.text ? renderEmphasis(msg.text) : null}</div>
                ) : msg.text ? (
                  <div className="fan-answer-card fan-answer-card--greeting">{renderEmphasis(msg.text)}</div>
                ) : msg.responseData ? (
                  <div className="fan-answer-card">
                    {msg.source && (
                      <div className={`fan-source-badge ${msg.source === 'Vertex AI via Cloud Run' ? 'fan-source-badge--cloud' : 'fan-source-badge--fallback'}`}>
                        <Icon name={msg.source === 'Vertex AI via Cloud Run' ? 'cloud' : 'fallback'} size={13} />
                        {msg.source === 'Vertex AI via Cloud Run' ? 'Vertex AI via Cloud Run' : 'Local deterministic fallback'}
                      </div>
                    )}

                    {msg.fallbackReasonText && (
                      <div className="fan-answer-card__fallback-reason">
                        <Icon name="info" size={13} />{msg.fallbackReasonText}
                      </div>
                    )}

                    <div className="fan-answer-card__answer">
                      <strong>Assistant Answer</strong>
                      <p>{renderEmphasis(msg.responseData.answer)}</p>
                    </div>

                    <div className="fan-answer-card__action">
                      <strong>Recommended Action:</strong>
                      <span>{msg.responseData.action}</span>
                    </div>

                    <div className="fan-answer-card__grounding">
                      <strong>Telemetry Grounding Data used:</strong>
                      <code>{msg.responseData.telemetryUsed}</code>
                    </div>

                    <footer className="fan-answer-card__limitations">
                      <Icon name="warning" size={13} />{msg.responseData.disclaimer}
                    </footer>
                  </div>
                ) : null}
                <time className="fan-message__timestamp">{msg.timestamp}</time>
              </article>
            ))}
            {isLoading && (
              <div className="fan-chat__loading" role="status" aria-live="polite">
                <Icon name="spark" size={14} />Generating guidance via Vertex AI...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <aside className="fan-quick-commands" aria-labelledby="fan-quick-commands-title">
          <div className="fan-quick-commands__header">
            <span>Command rail</span>
            <h3 id="fan-quick-commands-title">Quick Guidance Prompts</h3>
          </div>
          <div className="fan-quick-commands__list">
            {QUICK_COMMANDS.map((command, index) => (
              <button
                className="fan-quick-command"
                type="button"
                key={command.key}
                onClick={() => handlePromptClick(command.key, command.query)}
                disabled={isLoading}
              >
                <span className="fan-quick-command__number">{String(index + 1).padStart(2, '0')}</span>
                <Icon name={command.icon} size={16} />
                {command.label}
              </button>
            ))}
          </div>
          <p className="fan-quick-commands__disclaimer">This assistant uses simulated telemetry only — no external systems.</p>
        </aside>

        <form className="fan-composer" onSubmit={handleCustomSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about gates, concession wait times, transit, accessibility, or sustainability..."
          />
          <button type="submit" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send'}</button>
        </form>
      </section>
    </div>
  );
};

export default FanAssistant;

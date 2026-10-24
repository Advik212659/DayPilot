import React, { useState, useEffect, useRef } from 'react';

export default function Chat({
  messages,
  isGenerating,
  onSendMessage,
  onNewConversation,
  conversations,
  currentConvId,
  onSelectConversation
}) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docContent, setDocContent] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Voice speech synthesis
  const speakText = (text) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`\n]/g, ' ').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    window.speechSynthesis.speak(utterance);
  };

  // Voice recognition
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          onSendMessage(transcript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleDocAnalyze = () => {
    if (!docContent.trim()) return;
    onSendMessage(`Analyze this document, extract key takeaways, and list actionable to-dos:\n\n${docContent}`);
    setDocContent('');
    setShowDocModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Chat Top Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--cyan), var(--indigo))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            color: '#fff'
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>Daypilot AI</div>
            <div style={{ fontSize: '12px', color: isGenerating ? 'var(--cyan)' : isListening ? 'var(--danger)' : 'var(--text-muted)' }}>
              {isGenerating ? 'Thinking & organizing...' : isListening ? 'Listening to voice...' : 'Online & ready'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Conversation Switcher */}
          <select
            value={currentConvId}
            onChange={(e) => onSelectConversation(Number(e.target.value))}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {conversations.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          {/* New Chat Button */}
          <button
            onClick={onNewConversation}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: 'var(--cyan)',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + New Chat
          </button>

          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute Voice" : "Mute Voice"}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: isMuted ? 'var(--danger)' : 'var(--text-muted)',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Message List */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: '12px'
              }}
            >
              {!isUser && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  flexShrink: 0
                }}>
                  🤖
                </div>
              )}

              <div style={{ maxWidth: '75%' }}>
                <div style={{
                  background: isUser ? 'linear-gradient(135deg, var(--cyan) 0%, var(--indigo) 100%)' : 'var(--bg-input)',
                  border: isUser ? 'none' : '1px solid var(--border)',
                  color: '#fff',
                  padding: '14px 18px',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {msg.content}

                  {msg.toolPayload && (
                    <div style={{
                      marginTop: '10px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      color: 'var(--cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: '600'
                    }}>
                      <span>⚡</span> Action Executed Successfully
                    </div>
                  )}
                </div>

                {!isUser && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px', paddingLeft: '4px' }}>
                    <button
                      onClick={() => speakText(msg.content)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
                    >
                      🔊 Listen
                    </button>
                    <button
                      onClick={() => handleCopy(msg.content)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
                    >
                      📋 Copy
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  flexShrink: 0
                }}>
                  👤
                </div>
              )}
            </div>
          );
        })}

        {isGenerating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🤖
            </div>
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '12px 18px', borderRadius: '18px', fontSize: '14px', color: 'var(--cyan)' }}>
              Daypilot is thinking & planning...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      <div style={{ padding: '8px 24px', display: 'flex', gap: '8px', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => onSendMessage("Plan my day and highlight potential conflicts")}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🌅 Plan my day
        </button>
        <button
          onClick={() => onSendMessage("Add a task to review deliverables tomorrow at 2 PM")}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ⚡ Add a task
        </button>
        <button
          onClick={() => onSendMessage("Schedule a meeting with client tomorrow at 3 PM")}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📅 Schedule event
        </button>
        <button
          onClick={() => onSendMessage("Remember that I prefer morning meetings before 11 AM")}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🧠 Save memory
        </button>
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} style={{ padding: '16px 24px', background: 'var(--bg-input)', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
        {/* Document attachment button */}
        <button
          type="button"
          onClick={() => setShowDocModal(true)}
          title="Document & Note Intelligence"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--cyan)',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          📎
        </button>

        <input
          type="text"
          placeholder="Message Daypilot..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '12px 18px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none'
          }}
        />

        {/* Voice microphone button */}
        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? "Stop listening" : "Speak to Daypilot"}
          style={{
            background: isListening ? 'var(--danger)' : 'rgba(255,255,255,0.08)',
            border: '1px solid var(--border)',
            color: '#fff',
            borderRadius: '12px',
            width: '42px',
            height: '42px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
        >
          {isListening ? '🛑' : '🎙️'}
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={!input.trim() || isGenerating}
          style={{
            background: input.trim() && !isGenerating ? 'linear-gradient(135deg, var(--cyan), var(--indigo))' : 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#fff',
            borderRadius: '12px',
            padding: '0 20px',
            height: '42px',
            fontWeight: '600',
            cursor: input.trim() && !isGenerating ? 'pointer' : 'default',
            boxShadow: input.trim() && !isGenerating ? '0 4px 12px rgba(56, 189, 248, 0.3)' : 'none'
          }}
        >
          Send
        </button>
      </form>

      {/* Document Intelligence Modal */}
      {showDocModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Document & Note Intelligence</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
              Paste meeting notes, document text, or CSV snippets. Daypilot will analyze it, summarize takeaways, and extract tasks.
            </p>
            <textarea
              rows={8}
              placeholder="Paste document text here..."
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => setShowDocModal(false)}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDocAnalyze}
                disabled={!docContent.trim()}
                style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Analyze with AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';

export default function Settings({ onClearAllData }) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-3.5-flash');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim(), model })
      });
      if (res.ok) {
        setStatusMsg('✅ Settings & API Key saved successfully!');
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err) {
      setStatusMsg('Error saving settings: ' + err.message);
    }
  };

  const handleTestVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Hello! I am Daypilot, your intelligent personal AI assistant. Voice engine is active and ready.");
    utterance.rate = speechRate;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Settings & Privacy</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>AI model orchestration, voice parameters, and privacy control</p>
      </div>

      {statusMsg && (
        <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid var(--cyan)', color: 'var(--cyan)', padding: '12px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
          {statusMsg}
        </div>
      )}

      {/* 1. Gemini AI Provider */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>🤖 Google Gemini AI Configuration</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          Configure your Gemini API Key. If left blank, Daypilot uses the server's <code>GEMINI_API_KEY</code> from environment secrets or its intelligent local grounded generator.
        </p>

        <form onSubmit={handleSaveApiKey} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Custom Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', color: '#fff', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Selected AI Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', color: '#fff', outline: 'none' }}
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Fast, responsive for chat, planning, and tasks)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep reasoning, complex coding, and multi-step tasks)</option>
            </select>
          </div>

          <button
            type="submit"
            style={{ alignSelf: 'flex-start', background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', borderRadius: '10px', padding: '10px 22px', cursor: 'pointer' }}
          >
            Save Settings
          </button>
        </form>
      </div>

      {/* 2. Voice Assistant Parameters */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>🎙️ Voice Assistant Settings</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          Adjust text-to-speech speed and speech synthesis behavior.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Speaking Speed</span>
              <span>{speechRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cyan)' }}
            />
          </div>

          <button
            onClick={handleTestVoice}
            style={{ alignSelf: 'flex-start', background: 'var(--bg-input)', border: '1px solid var(--border)', color: '#fff', borderRadius: '10px', padding: '8px 18px', cursor: 'pointer', fontSize: '13px' }}
          >
            🔊 Test Voice Output
          </button>
        </div>
      </div>

      {/* 3. Privacy & Sovereign Data */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>🛡️ Privacy & Data Sovereignty</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
          • Daypilot does not log, harvest, or sell your personal data.<br/>
          • Memories and chat histories are stored locally on your server database.<br/>
          • You maintain complete rights to view, toggle, or erase memories at any time.
        </p>

        <button
          onClick={onClearAllData}
          style={{ background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
        >
          Reset All Data & Start Fresh
        </button>
      </div>

      {/* 4. About Daypilot AI */}
      <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-dim)', fontSize: '13px' }}>
        <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Daypilot AI Full-Stack Web v1.0</div>
        <div>Think • Plan • Organize • Create • Remember • Automate</div>
        <div style={{ marginTop: '4px' }}>Ready for VS Code & Deployment to Render</div>
      </div>
    </div>
  );
}

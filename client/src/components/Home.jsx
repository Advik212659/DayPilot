import React, { useState } from 'react';

export default function Home({
  briefing,
  tasks,
  events,
  projects,
  onNavigate,
  onSendMessage,
  onToggleTask,
  onRefreshBriefing,
  onOpenQuickTask
}) {
  const [quickInput, setQuickInput] = useState('');

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const topTasks = pendingTasks.slice(0, 3);
  const upcomingEvents = events.slice(0, 2);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onSendMessage(quickInput.trim());
    setQuickInput('');
    onNavigate('chat');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Hero Greeting & Quick Input Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
              {briefing?.greeting || 'Welcome back'}, Vaishnavi
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {briefing?.dateText || 'Today'} • Your personal AI workspace is synchronized
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '13px',
            color: 'var(--cyan)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)' }}></span>
            Daypilot Online
          </div>
        </div>

        {/* Quick prompt input bar */}
        <form onSubmit={handleQuickSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Ask Daypilot anything or command: 'Schedule meeting tomorrow at 3 PM', 'Plan my day'..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '14px 20px',
              color: '#fff',
              fontSize: '15px',
              outline: 'none',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, var(--cyan) 0%, var(--indigo) 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              padding: '0 24px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)'
            }}
          >
            Ask AI ➔
          </button>
        </form>
      </div>

      {/* 2. Intelligence Briefing Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>💡</span>
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Daily Intelligence Briefing</h2>
          </div>
          <button
            onClick={onRefreshBriefing}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            ↻ Refresh
          </button>
        </div>
        <p style={{ color: 'var(--text-main)', fontSize: '15px', lineHeight: '1.6', marginBottom: '14px' }}>
          {briefing?.summary || 'Analyzing your daily calendar and priority task matrix...'}
        </p>
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '14px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#e0f2fe' }}>
            {briefing?.recommendedFocus || 'Great day to make steady progress on high-impact projects.'}
          </span>
        </div>
      </div>

      {/* 3. Quick Action Chips */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={onOpenQuickTask}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px 18px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}
          >
            <span>+</span> New Task
          </button>
          <button
            onClick={() => onNavigate('calendar')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px 18px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}
          >
            <span>📅</span> Schedule Event
          </button>
          <button
            onClick={() => {
              onSendMessage('Generate a detailed morning plan and analyze schedule conflicts');
              onNavigate('chat');
            }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px 18px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}
          >
            <span>🌅</span> Run Morning Plan
          </button>
          <button
            onClick={() => {
              onSendMessage('Help me draft a crisp professional email update');
              onNavigate('chat');
            }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px 18px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}
          >
            <span>✍️</span> Draft Email
          </button>
          <button
            onClick={() => onNavigate('workspace')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px 18px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}
          >
            <span>🧠</span> View Memories
          </button>
        </div>
      </div>

      {/* 4. Priority Tasks & Today's Schedule Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Tasks Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Priority Tasks</h3>
            <button
              onClick={() => onNavigate('tasks')}
              style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontSize: '13px' }}
            >
              View all ({pendingTasks.length}) ➔
            </button>
          </div>
          {topTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
              🎉 All tasks completed! Ask Daypilot to add more.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => onToggleTask(task.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--cyan)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{task.title}</div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span style={{
                        color: task.priority === 'Urgent' ? 'var(--danger)' : task.priority === 'High' ? 'var(--warning)' : 'var(--cyan)',
                        fontWeight: '600'
                      }}>
                        {task.priority}
                      </span>
                      <span>•</span>
                      <span>{task.category}</span>
                      {task.dueDate && <><span>•</span><span>Due: {task.dueDate}</span></>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Today's Schedule</h3>
            <button
              onClick={() => onNavigate('calendar')}
              style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontSize: '13px' }}
            >
              Full Calendar ➔
            </button>
          </div>
          {upcomingEvents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
              No meetings scheduled today. Enjoy focused time!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#c7d2fe',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {event.startTime}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{event.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {event.date} • {event.location || 'Google Meet'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Active Projects Glance */}
      {projects.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Active Projects</h3>
            <button
              onClick={() => onNavigate('workspace')}
              style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontSize: '13px' }}
            >
              Manage Projects ➔
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {projects.slice(0, 2).map(proj => (
              <div
                key={proj.id}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '15px' }}>{proj.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--cyan)', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                    {proj.category}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '6px 0 12px 0' }}>{proj.description}</p>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, var(--cyan), var(--indigo))' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

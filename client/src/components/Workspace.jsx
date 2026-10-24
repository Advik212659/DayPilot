import React, { useState } from 'react';

export default function Workspace({
  projects,
  knowledge,
  memories,
  reminders,
  onAddProject,
  onDeleteProject,
  onAddKnowledge,
  onDeleteKnowledge,
  onAddMemory,
  onToggleMemory,
  onDeleteMemory,
  onClearMemories,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onRunAutomation
}) {
  const [activeTab, setActiveTab] = useState('projects'); // projects, knowledge, automations, memories, reminders

  // Modal states
  const [showProjModal, setShowProjModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showMemModal, setShowMemModal] = useState(false);
  const [showRemModal, setShowRemModal] = useState(false);

  // Form states
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCat, setProjCat] = useState('Work');
  const [projDeadline, setProjDeadline] = useState('');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  const [memContent, setMemContent] = useState('');
  const [memCategory, setMemCategory] = useState('Preferences');

  const [remTitle, setRemTitle] = useState('');
  const [remDate, setRemDate] = useState(new Date().toISOString().split('T')[0]);
  const [remTime, setRemTime] = useState('09:00');
  const [remRec, setRemRec] = useState('Once');

  // Automation inputs
  const [meetingNotesInput, setMeetingNotesInput] = useState('');
  const [goalBreakdownInput, setGoalBreakdownInput] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Workspace Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Workspace & Intelligence</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Long-term memory, project management, and automated workflows</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'projects', label: `Projects (${projects.length})` },
          { id: 'knowledge', label: `Knowledge (${knowledge.length})` },
          { id: 'automations', label: 'Automation Studio' },
          { id: 'memories', label: `Long-Term Memory (${memories.length})` },
          { id: 'reminders', label: `Reminders (${reminders.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'var(--cyan)' : 'var(--bg-card)',
              color: activeTab === tab.id ? '#0f172a' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? '700' : '500',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '8px 18px',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Projects */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Active Projects & Goals</h3>
            <button
              onClick={() => setShowProjModal(true)}
              style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer' }}
            >
              + New Project
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {projects.map(proj => (
              <div
                key={proj.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>{proj.name}</span>
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{proj.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)' }}>
                  <span>Category: {proj.category}</span>
                  {proj.deadline && <span style={{ color: 'var(--cyan)' }}>Deadline: {proj.deadline}</span>}
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, var(--cyan), var(--indigo))' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Knowledge Base */}
      {activeTab === 'knowledge' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Personal Knowledge Base</h3>
            <button
              onClick={() => setShowNoteModal(true)}
              style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer' }}
            >
              + Save Note / Idea
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {knowledge.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>{item.title}</span>
                  <button
                    onClick={() => onDeleteKnowledge(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {item.content}
                </p>
                {item.tags && (
                  <div style={{ fontSize: '12px', color: 'var(--cyan)', marginTop: '4px' }}>
                    Tags: {item.tags}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Automation Studio */}
      {activeTab === 'automations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Automation Studio</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Pre-configured AI workflows for daily productivity</p>
          </div>

          {/* Workflow 1: Morning Briefing */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>🌅 Executive Morning Briefing</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
              Synthesizes today's schedule, priority tasks, and generates your focus recommendation.
            </p>
            <button
              onClick={() => onRunAutomation('Generate my personalized morning briefing and organize my day based on my schedule and tasks.')}
              style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', borderRadius: '10px', padding: '8px 18px', cursor: 'pointer' }}
            >
              Run Morning Briefing ➔
            </button>
          </div>

          {/* Workflow 2: Meeting Notes to Tasks */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>📝 Meeting Notes to Action Items</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px' }}>
              Paste unstructured meeting notes or brainstorm logs to automatically parse into concrete tasks.
            </p>
            <textarea
              rows={3}
              placeholder="Paste notes here..."
              value={meetingNotesInput}
              onChange={(e) => setMeetingNotesInput(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '10px' }}
            />
            <button
              onClick={() => {
                onRunAutomation(`Extract actionable tasks from these notes and format them clearly:\n${meetingNotesInput}`);
                setMeetingNotesInput('');
              }}
              disabled={!meetingNotesInput.trim()}
              style={{ background: meetingNotesInput.trim() ? 'var(--cyan)' : 'var(--bg-input)', border: 'none', color: meetingNotesInput.trim() ? '#0f172a' : 'var(--text-dim)', fontWeight: '700', borderRadius: '10px', padding: '8px 18px', cursor: meetingNotesInput.trim() ? 'pointer' : 'default' }}
            >
              Extract & Create Tasks ➔
            </button>
          </div>

          {/* Workflow 3: Goal Breakdown */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>🎯 Project & Goal Breakdown Planner</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px' }}>
              Input any goal or deliverable to generate milestones, prerequisites, and tasks.
            </p>
            <input
              type="text"
              placeholder="e.g., Redesign landing page or Prepare product launch..."
              value={goalBreakdownInput}
              onChange={(e) => setGoalBreakdownInput(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '10px' }}
            />
            <button
              onClick={() => {
                onRunAutomation(`Break down this goal/project into manageable milestones and concrete tasks:\n${goalBreakdownInput}`);
                setGoalBreakdownInput('');
              }}
              disabled={!goalBreakdownInput.trim()}
              style={{ background: goalBreakdownInput.trim() ? 'var(--cyan)' : 'var(--bg-input)', border: 'none', color: goalBreakdownInput.trim() ? '#0f172a' : 'var(--text-dim)', fontWeight: '700', borderRadius: '10px', padding: '8px 18px', cursor: goalBreakdownInput.trim() ? 'pointer' : 'default' }}
            >
              Generate Project Breakdown ➔
            </button>
          </div>

          {/* Workflow 4: Weekly Review */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>📊 Weekly Review & Synthesis</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
              Summarizes completed tasks, active milestones, and prepares recommended actions for next week.
            </p>
            <button
              onClick={() => onRunAutomation('Prepare a comprehensive weekly review summarizing my completed tasks, active projects, and upcoming priorities.')}
              style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', borderRadius: '10px', padding: '8px 18px', cursor: 'pointer' }}
            >
              Run Weekly Review ➔
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Long-Term Memories */}
      {activeTab === 'memories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>User-Controlled Long-Term Memories</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Daypilot automatically references active memories in every prompt</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowMemModal(true)}
                style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer' }}
              >
                + Add Memory
              </button>
              {memories.length > 0 && (
                <button
                  onClick={onClearMemories}
                  style={{ background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer' }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {memories.map(mem => (
              <div
                key={mem.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <input
                  type="checkbox"
                  checked={mem.isActive}
                  onChange={() => onToggleMemory(mem.id)}
                  title="Toggle memory active status"
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--cyan)' }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                      {mem.category}
                    </span>
                    <span style={{ fontSize: '12px', color: mem.isActive ? 'var(--emerald)' : 'var(--text-dim)' }}>
                      {mem.isActive ? 'Active (referenced in prompts)' : 'Inactive (disabled)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: mem.isActive ? '#fff' : 'var(--text-muted)', marginTop: '4px' }}>
                    {mem.content}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMemory(mem.id)}
                  title="Delete memory"
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '16px' }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Reminders */}
      {activeTab === 'reminders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Smart Reminders</h3>
            <button
              onClick={() => setShowRemModal(true)}
              style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer' }}
            >
              + New Reminder
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reminders.map(rem => (
              <div
                key={rem.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <input
                  type="checkbox"
                  checked={rem.isCompleted}
                  onChange={() => onToggleReminder(rem.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--cyan)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', textDecoration: rem.isCompleted ? 'line-through' : 'none', color: rem.isCompleted ? 'var(--text-muted)' : '#fff' }}>
                    {rem.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    📅 {rem.date} at {rem.time} • Recurrence: {rem.recurrence}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Create Project</h3>
            <input
              type="text"
              placeholder="Project Name *"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '10px' }}
            />
            <textarea
              rows={2}
              placeholder="Description & Goals"
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '10px' }}
            />
            <input
              type="date"
              value={projDeadline}
              onChange={(e) => setProjDeadline(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '14px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowProjModal(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  if (projName.trim()) {
                    onAddProject({ name: projName.trim(), description: projDesc.trim(), category: projCat, deadline: projDeadline });
                    setProjName('');
                    setProjDesc('');
                    setShowProjModal(false);
                  }
                }}
                style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Save Note / Idea</h3>
            <input
              type="text"
              placeholder="Title *"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '10px' }}
            />
            <textarea
              rows={4}
              placeholder="Content / Notes *"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={noteTags}
              onChange={(e) => setNoteTags(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '14px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowNoteModal(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  if (noteTitle.trim() && noteContent.trim()) {
                    onAddKnowledge({ title: noteTitle.trim(), content: noteContent.trim(), tags: noteTags.trim() });
                    setNoteTitle('');
                    setNoteContent('');
                    setNoteTags('');
                    setShowNoteModal(false);
                  }
                }}
                style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memory Modal */}
      {showMemModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Add Long-Term Memory</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
              Tell Daypilot what to remember about you across all conversations.
            </p>
            <textarea
              rows={3}
              placeholder="e.g., I work in GMT-7 time zone and prefer direct bullet points."
              value={memContent}
              onChange={(e) => setMemContent(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '10px' }}
            />
            <select
              value={memCategory}
              onChange={(e) => setMemCategory(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '14px' }}
            >
              <option value="Preferences">Preferences</option>
              <option value="Workflows">Workflows</option>
              <option value="Goals">Goals</option>
              <option value="Personal">Personal</option>
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowMemModal(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  if (memContent.trim()) {
                    onAddMemory({ category: memCategory, content: memContent.trim() });
                    setMemContent('');
                    setShowMemModal(false);
                  }
                }}
                style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Remember
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showRemModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Set Reminder</h3>
            <input
              type="text"
              placeholder="Reminder Title *"
              value={remTitle}
              onChange={(e) => setRemTitle(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '10px' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input
                type="date"
                value={remDate}
                onChange={(e) => setRemDate(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
              />
              <input
                type="time"
                value={remTime}
                onChange={(e) => setRemTime(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
              />
            </div>
            <select
              value={remRec}
              onChange={(e) => setRemRec(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', marginBottom: '14px' }}
            >
              <option value="Once">Once</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowRemModal(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  if (remTitle.trim()) {
                    onAddReminder({ title: remTitle.trim(), date: remDate, time: remTime, recurrence: remRec });
                    setRemTitle('');
                    setShowRemModal(false);
                  }
                }}
                style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

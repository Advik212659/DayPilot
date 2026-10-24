import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Chat from './components/Chat';
import Tasks from './components/Tasks';
import CalendarView from './components/CalendarView';
import Workspace from './components/Workspace';
import Settings from './components/Settings';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home'); // home, chat, tasks, calendar, workspace, settings

  // State
  const [briefing, setBriefing] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [memories, setMemories] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Initial Fetch
  const loadAllData = async () => {
    try {
      const [bRes, tRes, eRes, pRes, mRes, kRes, rRes, cRes] = await Promise.all([
        fetch('/api/briefing').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/events').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/memories').then(r => r.json()),
        fetch('/api/knowledge').then(r => r.json()),
        fetch('/api/reminders').then(r => r.json()),
        fetch('/api/conversations').then(r => r.json())
      ]);

      if (bRes) setBriefing(bRes);
      if (tRes?.tasks) setTasks(tRes.tasks);
      if (eRes?.events) setEvents(eRes.events);
      if (pRes?.projects) setProjects(pRes.projects);
      if (mRes?.memories) setMemories(mRes.memories);
      if (kRes?.knowledge) setKnowledge(kRes.knowledge);
      if (rRes?.reminders) setReminders(rRes.reminders);
      if (cRes?.conversations) setConversations(cRes.conversations);
      if (cRes?.messages) setMessages(cRes.messages);
    } catch (err) {
      console.error("Failed to load initial data from server:", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Send message to AI
  const handleSendMessage = async (prompt) => {
    if (!prompt) return;
    setIsGenerating(true);

    // Optimistically add user message
    const tempUserMsg = {
      id: Date.now(),
      conversationId: currentConvId,
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, conversationId: currentConvId })
      });
      const data = await res.json();
      if (data?.message) {
        setMessages(prev => [...prev, data.message]);
        // Refresh tasks and events in case an action was executed
        loadAllData();
      }
    } catch (err) {
      console.error("Error sending message:", err);
      showToast("Error processing message");
    } finally {
      setIsGenerating(false);
    }
  };

  // Task actions
  const handleAddTask = async (taskData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const data = await res.json();
      if (data?.task) {
        setTasks(prev => [data.task, ...prev]);
        showToast("Task created!");
        loadAllData();
      }
    } catch (e) {
      showToast("Error adding task");
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, { method: 'PUT' });
      const data = await res.json();
      if (data?.task) {
        setTasks(prev => prev.map(t => t.id === id ? data.task : t));
      }
    } catch (e) {
      showToast("Error toggling task");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast("Task removed");
    } catch (e) {
      showToast("Error deleting task");
    }
  };

  // Event actions
  const handleAddEvent = async (eventData) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const data = await res.json();
      if (data?.event) {
        setEvents(prev => [...prev, data.event]);
        showToast("Event scheduled!");
        loadAllData();
      }
    } catch (e) {
      showToast("Error adding event");
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      setEvents(prev => prev.filter(e => e.id !== id));
      showToast("Event deleted");
    } catch (e) {
      showToast("Error deleting event");
    }
  };

  // Project actions
  const handleAddProject = async (pData) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pData)
      });
      const data = await res.json();
      if (data?.project) {
        setProjects(prev => [data.project, ...prev]);
        showToast("Project created!");
      }
    } catch (e) {
      showToast("Error adding project");
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast("Project deleted");
    } catch (e) {
      showToast("Error deleting project");
    }
  };

  // Knowledge actions
  const handleAddKnowledge = async (kData) => {
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kData)
      });
      const data = await res.json();
      if (data?.note) {
        setKnowledge(prev => [data.note, ...prev]);
        showToast("Saved to Knowledge Base!");
      }
    } catch (e) {
      showToast("Error saving note");
    }
  };

  const handleDeleteKnowledge = async (id) => {
    try {
      await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
      setKnowledge(prev => prev.filter(k => k.id !== id));
      showToast("Note deleted");
    } catch (e) {
      showToast("Error deleting note");
    }
  };

  // Memory actions
  const handleAddMemory = async (mData) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mData)
      });
      const data = await res.json();
      if (data?.memory) {
        setMemories(prev => [data.memory, ...prev]);
        showToast("Memory saved!");
      }
    } catch (e) {
      showToast("Error saving memory");
    }
  };

  const handleToggleMemory = async (id) => {
    try {
      const res = await fetch(`/api/memories/${id}/toggle`, { method: 'PUT' });
      const data = await res.json();
      if (data?.memory) {
        setMemories(prev => prev.map(m => m.id === id ? data.memory : m));
      }
    } catch (e) {
      showToast("Error updating memory");
    }
  };

  const handleDeleteMemory = async (id) => {
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      setMemories(prev => prev.filter(m => m.id !== id));
      showToast("Memory deleted");
    } catch (e) {
      showToast("Error deleting memory");
    }
  };

  const handleClearMemories = async () => {
    if (!window.confirm("Are you sure you want to clear all long-term memories?")) return;
    try {
      await fetch('/api/memories/clear/all', { method: 'DELETE' });
      setMemories([]);
      showToast("All memories cleared");
    } catch (e) {
      showToast("Error clearing memories");
    }
  };

  // Reminder actions
  const handleAddReminder = async (rData) => {
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rData)
      });
      const data = await res.json();
      if (data?.reminder) {
        setReminders(prev => [data.reminder, ...prev]);
        showToast("Reminder set!");
      }
    } catch (e) {
      showToast("Error setting reminder");
    }
  };

  const handleToggleReminder = async (id) => {
    try {
      const res = await fetch(`/api/reminders/${id}/toggle`, { method: 'PUT' });
      const data = await res.json();
      if (data?.reminder) {
        setReminders(prev => prev.map(r => r.id === id ? data.reminder : r));
      }
    } catch (e) {
      showToast("Error updating reminder");
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      setReminders(prev => prev.filter(r => r.id !== id));
      showToast("Reminder removed");
    } catch (e) {
      showToast("Error deleting reminder");
    }
  };

  // New Chat
  const handleNewConversation = async () => {
    try {
      const res = await fetch('/api/conversations', { method: 'POST' });
      const data = await res.json();
      if (data?.conversation) {
        setConversations(prev => [data.conversation, ...prev]);
        setCurrentConvId(data.conversation.id);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            conversationId: data.conversation.id,
            role: 'assistant',
            content: "Started a fresh conversation. What would you like to plan, organize, or create?",
            timestamp: Date.now()
          }
        ]);
        showToast("New chat started");
      }
    } catch (e) {
      showToast("Error creating chat");
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'chat', label: 'AI Chat', icon: '💬' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'workspace', label: 'Workspace', icon: '📂' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, var(--cyan), var(--indigo))',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '14px',
          zIndex: 99999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}>
          {toast}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside style={{
        width: '240px',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        flexShrink: 0
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '32px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--cyan) 0%, var(--indigo) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)'
          }}>
            🧭
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>Daypilot AI</div>
            <div style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Personal Copilot
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.15))' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Status */}
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '12px 14px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', fontWeight: '600', marginBottom: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)' }}></span>
            Ready for VS Code
          </div>
          <div style={{ fontSize: '11px' }}>Render Deployable</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', maxHeight: '100vh' }}>
        {currentTab === 'home' && (
          <Home
            briefing={briefing}
            tasks={tasks}
            events={events}
            projects={projects}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSendMessage={handleSendMessage}
            onToggleTask={handleToggleTask}
            onRefreshBriefing={loadAllData}
            onOpenQuickTask={() => setCurrentTab('tasks')}
          />
        )}

        {currentTab === 'chat' && (
          <Chat
            messages={messages.filter(m => m.conversationId === currentConvId)}
            isGenerating={isGenerating}
            onSendMessage={handleSendMessage}
            onNewConversation={handleNewConversation}
            conversations={conversations}
            currentConvId={currentConvId}
            onSelectConversation={(id) => setCurrentConvId(id)}
          />
        )}

        {currentTab === 'tasks' && (
          <Tasks
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            events={events}
            tasks={tasks}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onToggleTask={handleToggleTask}
          />
        )}

        {currentTab === 'workspace' && (
          <Workspace
            projects={projects}
            knowledge={knowledge}
            memories={memories}
            reminders={reminders}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            onAddKnowledge={handleAddKnowledge}
            onDeleteKnowledge={handleDeleteKnowledge}
            onAddMemory={handleAddMemory}
            onToggleMemory={handleToggleMemory}
            onDeleteMemory={handleDeleteMemory}
            onClearMemories={handleClearMemories}
            onAddReminder={handleAddReminder}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onRunAutomation={(prompt) => {
              setCurrentTab('chat');
              handleSendMessage(prompt);
            }}
          />
        )}

        {currentTab === 'settings' && (
          <Settings
            onClearAllData={() => {
              if (window.confirm("Reset all Daypilot database items to default state?")) {
                loadAllData();
                showToast("Data reloaded");
              }
            }}
          />
        )}
      </main>
    </div>
  );
}

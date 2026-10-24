require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { readDb, writeDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory or persisted settings
let customApiKey = process.env.GEMINI_API_KEY || '';
let selectedModel = 'gemini-3.5-flash';

// Helper to get active API key
function getApiKey() {
  return customApiKey || process.env.GEMINI_API_KEY || '';
}

// Format current date
function getTodayDate() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// -------------------------------------------------------------
// AI Chat & Tool Calling Orchestrator
// -------------------------------------------------------------
async function callGemini(prompt, systemInstruction, history = []) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null; // Will trigger intelligent local generator
  }

  const model = selectedModel || 'gemini-3.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [];
  for (const h of history) {
    contents.push({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Gemini API Error:', response.status, errText);
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  return text || 'No response returned from model.';
}

// Intelligent grounded intent detector and executor
function handleActionIntent(prompt, db) {
  const lower = prompt.toLowerCase().trim();
  let actionResult = null;

  if (lower.startsWith('add task') || lower.startsWith('create task') || lower.includes('remind me to')) {
    const title = prompt
      .replace(/^(add task|create task|remind me to)\s*/i, '')
      .replace(/(tomorrow|today|at \d+(:\\d+)?(am|pm)?)/gi, '')
      .trim() || 'New Task from Daypilot';
    const dueDate = lower.includes('tomorrow')
      ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
      : getTodayDate();
    const priority = lower.includes('urgent') ? 'Urgent' : lower.includes('high') ? 'High' : 'Medium';
    
    const newTask = {
      id: Date.now(),
      title,
      description: '',
      dueDate,
      dueTime: '14:00',
      priority,
      category: 'Work',
      isCompleted: false,
      subtasks: [],
      createdAt: Date.now()
    };
    db.tasks.unshift(newTask);
    actionResult = `Created Task: "${title}" (Due: ${dueDate}, Priority: ${priority})`;
  } else if (lower.startsWith('schedule') || lower.startsWith('add event') || lower.startsWith('create meeting')) {
    const title = prompt
      .replace(/^(schedule|add event|create meeting)\s*/i, '')
      .replace(/(tomorrow|today|at \d+(:\\d+)?(am|pm)?)/gi, '')
      .trim() || 'Scheduled Meeting';
    const date = lower.includes('tomorrow')
      ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
      : getTodayDate();
    
    const newEvent = {
      id: Date.now(),
      title,
      description: 'Scheduled via Daypilot Copilot',
      date,
      startTime: '15:00',
      endTime: '16:00',
      location: 'Google Meet',
      category: 'Meeting',
      createdAt: Date.now()
    };
    db.events.push(newEvent);
    actionResult = `Scheduled Event: "${title}" on ${date} (15:00 - 16:00)`;
  } else if (lower.startsWith('remember that') || lower.startsWith('remember:') || lower.startsWith('save memory')) {
    const content = prompt.replace(/^(remember that|remember:|save memory:?)\s*/i, '').trim();
    const newMemory = {
      id: Date.now(),
      category: 'Preferences',
      content,
      isActive: true,
      createdAt: Date.now()
    };
    db.memories.unshift(newMemory);
    actionResult = `Saved to Long-Term Memory: "${content}"`;
  } else if (lower.startsWith('note:') || lower.startsWith('save note')) {
    const content = prompt.replace(/^(note:|save note:?)\s*/i, '').trim();
    const newNote = {
      id: Date.now(),
      title: `Quick Note (${getTodayDate()})`,
      content,
      category: 'Notes',
      tags: 'quick, captured',
      isPinned: false,
      createdAt: Date.now()
    };
    db.knowledge.unshift(newNote);
    actionResult = `Added to Personal Knowledge Base: "${content}"`;
  }

  return actionResult;
}

// Local smart generator when API key is missing or offline
function generateLocalResponse(prompt, actionResult, db) {
  const lower = prompt.toLowerCase();
  const prefix = actionResult ? `✅ **Confirmed:** ${actionResult}\n\n` : '';
  const today = getTodayDate();
  const todayEvents = db.events.filter(e => e.date === today);
  const pendingTasks = db.tasks.filter(t => !t.isCompleted);

  if (lower.includes('plan') || lower.includes('organize my day') || lower.includes('briefing')) {
    const taskList = pendingTasks.slice(0, 3).map(t => `• **${t.title}** (${t.priority} Priority, Due: ${t.dueDate})`).join('\n') || '• No pending urgent tasks today!';
    const eventList = todayEvents.map(e => `• **${e.title}** at ${e.startTime} (${e.category})`).join('\n') || '• No conflicting meetings today.';

    return `${prefix}### 🌅 Daypilot Daily Briefing & Plan\n\n**📅 Date:** ${today}\n\n**🎯 Top Recommended Priorities:**\n${taskList}\n\n**📆 Today's Schedule:**\n${eventList}\n\n**💡 Personal Copilot Advice:**\nFocus on your highest-priority item early in your morning focus block before afternoon syncs.`;
  }

  if (lower.includes('summarize') || lower.includes('summary')) {
    return `${prefix}### 📑 Daypilot Summary Synthesis\n\n1. **Core Context**: Identified primary milestones and objectives.\n2. **Key Takeaways**:\n   • Isolated critical blockers and timelines.\n   • Mapped out sequential execution steps.\n3. **Recommendation**: You can save any identified action items directly as tasks in your Daypilot queue.`;
  }

  if (lower.includes('write') || lower.includes('draft') || lower.includes('email')) {
    return `${prefix}### ✍️ Daypilot Draft\n\n**Subject:** Update on Next Steps & Project Timeline\n\nHi team,\n\nI hope you're having a productive week. Here is a brief update on our active deliverables:\n\n• **Status:** On schedule with core deliverables.\n• **Immediate Focus:** Finalizing high-priority roadmap items.\n• **Next Milestone:** Review and testing session.\n\nPlease review and let me know if any adjustments are needed.\n\nBest regards,\n*Daypilot Workspace*`;
  }

  if (lower.includes('code') || lower.includes('function') || lower.includes('javascript') || lower.includes('python')) {
    return `${prefix}### 💻 Daypilot Technical Assistant\n\n\`\`\`javascript\n// Daypilot Async Task Executor\nasync function executeWorkflow(taskId) {\n  try {\n    console.log("Processing task execution:", taskId);\n    return { success: true, timestamp: Date.now() };\n  } catch (err) {\n    console.error("Workflow failed:", err);\n    return { success: false, error: err.message };\n  }\n}\n\`\`\`\n\n• **Complexity:** O(1)\n• **Environment:** Node.js 18+ / Browser\n• Would you like me to write unit tests or an API handler for this?`;
  }

  return `${prefix}I am **Daypilot**, your personal AI assistant. I have reviewed your active preferences and current schedule.\n\n• **Schedule:** ${db.events.length} upcoming events.\n• **Tasks:** ${pendingTasks.length} pending tasks.\n• **Memory:** ${db.memories.filter(m => m.isActive).length} active preferences loaded.\n\n*Try asking me:*\n- *"Plan my day"*\n- *"Add task to finalize proposal tomorrow"*\n- *"Schedule team standup at 10 AM"*\n- *"Remember that I prefer concise responses"*\n- *"Help me draft a client update email"*`;
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, conversationId = 1 } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const db = readDb();
    
    // 1. Record user message
    const userMsg = {
      id: Date.now(),
      conversationId: Number(conversationId),
      role: 'user',
      content: prompt,
      toolName: null,
      toolPayload: null,
      timestamp: Date.now()
    };
    db.messages.push(userMsg);

    // 2. Intent Action Execution
    const actionResult = handleActionIntent(prompt, db);

    // 3. Grounding context from DB
    const activeMemories = db.memories.filter(m => m.isActive);
    const memoriesText = activeMemories.length > 0
      ? "USER LONG-TERM MEMORIES (MUST RESPECT):\n" + activeMemories.map(m => `- [${m.category}] ${m.content}`).join('\n')
      : "No custom memories saved yet.";

    const today = getTodayDate();
    const tasksOverview = db.tasks.filter(t => !t.isCompleted).slice(0, 6).map(t => `${t.title} (${t.priority}, due: ${t.dueDate})`).join('; ');
    const eventsOverview = db.events.slice(0, 4).map(e => `${e.title} on ${e.date} at ${e.startTime}`).join('; ');

    const systemInstruction = `You are Daypilot, the intelligent, calm, and proactive personal AI assistant.
Today's Date is: ${today}.
Current user schedule/tasks:
- Outstanding Tasks: ${tasksOverview || 'None'}
- Upcoming Events: ${eventsOverview || 'None'}

${memoriesText}

Rules:
1. Be concise, organized, helpful, and supportive. Use markdown formatting with clear headings, bullet points, and code formatting when appropriate.
2. Ground all advice in the user's real schedule and tasks. Never invent meetings or commitments.
3. If the user asks to add/create a task, schedule an event, save a memory, or add a note, inform them that Daypilot has registered the action.`;

    // 4. Call Gemini or fallback
    let responseText = null;
    try {
      const history = db.messages.filter(m => m.conversationId === Number(conversationId)).slice(-6);
      responseText = await callGemini(prompt, systemInstruction, history);
      if (responseText && actionResult) {
        responseText += `\n\n> ⚡ **Daypilot Action Executed:** ${actionResult}`;
      }
    } catch (e) {
      console.warn("Falling back to local smart engine:", e.message);
    }

    if (!responseText) {
      responseText = generateLocalResponse(prompt, actionResult, db);
    }

    // 5. Record assistant response
    const assistantMsg = {
      id: Date.now() + 1,
      conversationId: Number(conversationId),
      role: 'assistant',
      content: responseText,
      toolName: actionResult ? 'daypilot_tool' : null,
      toolPayload: actionResult,
      timestamp: Date.now()
    };
    db.messages.push(assistantMsg);

    writeDb(db);
    res.json({ message: assistantMsg });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Conversations
app.get('/api/conversations', (req, res) => {
  const db = readDb();
  res.json({ conversations: db.conversations, messages: db.messages });
});

app.post('/api/conversations', (req, res) => {
  const db = readDb();
  const newConv = {
    id: Date.now(),
    title: `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  db.conversations.unshift(newConv);
  db.messages.push({
    id: Date.now() + 1,
    conversationId: newConv.id,
    role: 'assistant',
    content: "Started a fresh conversation. What would you like to plan, organize, or create?",
    toolName: null,
    toolPayload: null,
    timestamp: Date.now()
  });
  writeDb(db);
  res.json({ conversation: newConv });
});

// Tasks CRUD
app.get('/api/tasks', (req, res) => {
  const db = readDb();
  res.json({ tasks: db.tasks });
});

app.post('/api/tasks', (req, res) => {
  const db = readDb();
  const { title, description = '', dueDate = '', priority = 'Medium', category = 'Work' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newTask = {
    id: Date.now(),
    title,
    description,
    dueDate: dueDate || getTodayDate(),
    dueTime: '12:00',
    priority,
    category,
    isCompleted: false,
    subtasks: [],
    createdAt: Date.now()
  };
  db.tasks.unshift(newTask);
  writeDb(db);
  res.json({ task: newTask });
});

app.put('/api/tasks/:id/toggle', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const task = db.tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.isCompleted = !task.isCompleted;
  writeDb(db);
  res.json({ task });
});

app.delete('/api/tasks/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.tasks = db.tasks.filter(t => t.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// Events & Calendar
app.get('/api/events', (req, res) => {
  const db = readDb();
  res.json({ events: db.events });
});

app.post('/api/events', (req, res) => {
  const db = readDb();
  const { title, description = '', date, startTime = '10:00', endTime = '11:00', location = 'Google Meet', category = 'Meeting' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newEvent = {
    id: Date.now(),
    title,
    description,
    date: date || getTodayDate(),
    startTime,
    endTime,
    location,
    category,
    createdAt: Date.now()
  };
  db.events.push(newEvent);
  writeDb(db);
  res.json({ event: newEvent });
});

app.delete('/api/events/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.events = db.events.filter(e => e.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// Projects
app.get('/api/projects', (req, res) => {
  const db = readDb();
  res.json({ projects: db.projects });
});

app.post('/api/projects', (req, res) => {
  const db = readDb();
  const { name, description = '', category = 'Work', deadline = '' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const newProj = {
    id: Date.now(),
    name,
    description,
    category,
    deadline,
    milestones: [],
    colorHex: '#38BDF8',
    createdAt: Date.now()
  };
  db.projects.unshift(newProj);
  writeDb(db);
  res.json({ project: newProj });
});

app.delete('/api/projects/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.projects = db.projects.filter(p => p.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// Memories
app.get('/api/memories', (req, res) => {
  const db = readDb();
  res.json({ memories: db.memories });
});

app.post('/api/memories', (req, res) => {
  const db = readDb();
  const { category = 'Preferences', content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  const newMem = {
    id: Date.now(),
    category,
    content,
    isActive: true,
    createdAt: Date.now()
  };
  db.memories.unshift(newMem);
  writeDb(db);
  res.json({ memory: newMem });
});

app.put('/api/memories/:id/toggle', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const mem = db.memories.find(m => m.id === id);
  if (!mem) return res.status(404).json({ error: 'Memory not found' });
  mem.isActive = !mem.isActive;
  writeDb(db);
  res.json({ memory: mem });
});

app.delete('/api/memories/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.memories = db.memories.filter(m => m.id !== id);
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/memories/clear/all', (req, res) => {
  const db = readDb();
  db.memories = [];
  writeDb(db);
  res.json({ success: true });
});

// Knowledge Base
app.get('/api/knowledge', (req, res) => {
  const db = readDb();
  res.json({ knowledge: db.knowledge });
});

app.post('/api/knowledge', (req, res) => {
  const db = readDb();
  const { title, content, category = 'Notes', tags = '' } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

  const newNote = {
    id: Date.now(),
    title,
    content,
    category,
    tags,
    isPinned: false,
    createdAt: Date.now()
  };
  db.knowledge.unshift(newNote);
  writeDb(db);
  res.json({ note: newNote });
});

app.delete('/api/knowledge/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.knowledge = db.knowledge.filter(k => k.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// Reminders
app.get('/api/reminders', (req, res) => {
  const db = readDb();
  res.json({ reminders: db.reminders });
});

app.post('/api/reminders', (req, res) => {
  const db = readDb();
  const { title, date, time = '09:00', recurrence = 'Once' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newReminder = {
    id: Date.now(),
    title,
    date: date || getTodayDate(),
    time,
    recurrence,
    priority: 'Normal',
    isCompleted: false,
    createdAt: Date.now()
  };
  db.reminders.unshift(newReminder);
  writeDb(db);
  res.json({ reminder: newReminder });
});

app.put('/api/reminders/:id/toggle', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const rem = db.reminders.find(r => r.id === id);
  if (!rem) return res.status(404).json({ error: 'Reminder not found' });
  rem.isCompleted = !rem.isCompleted;
  writeDb(db);
  res.json({ reminder: rem });
});

app.delete('/api/reminders/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.reminders = db.reminders.filter(r => r.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// Daily Briefing Endpoint
app.get('/api/briefing', (req, res) => {
  const db = readDb();
  const today = getTodayDate();
  const todayEvents = db.events.filter(e => e.date === today);
  const pendingTasks = db.tasks.filter(t => !t.isCompleted);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const topTask = pendingTasks[0];

  const summary = pendingTasks.length === 0 && todayEvents.length === 0
    ? 'Your schedule is clear with no urgent deadlines today.'
    : `You have ${todayEvents.length} event(s) and ${pendingTasks.length} pending task(s) on your radar.`;

  const recommendedFocus = topTask
    ? `Recommended: Tackle "${topTask.title}" (${topTask.priority} priority) during your peak morning focus window.`
    : 'Recommended: Great day to advance active projects, review knowledge notes, or organize workflows.';

  res.json({
    greeting,
    dateText: new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    summary,
    recommendedFocus
  });
});

// Settings & API Key
app.get('/api/settings', (req, res) => {
  res.json({
    hasApiKey: !!getApiKey(),
    selectedModel
  });
});

app.post('/api/settings', (req, res) => {
  const { apiKey, model } = req.body;
  if (apiKey !== undefined) customApiKey = apiKey;
  if (model) selectedModel = model;
  res.json({ success: true, hasApiKey: !!getApiKey(), selectedModel });
});

// Serve React production build if available
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  const indexHtml = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Daypilot AI API Server</title></head>
        <body style="font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:40px;text-align:center;">
          <h1>🚀 Daypilot AI Backend Server</h1>
          <p>Node.js & Express REST APIs are running on port ${PORT}.</p>
          <p>Run <code>npm run dev</code> or <code>npm run build</code> in the <code>client/</code> directory to launch the React frontend.</p>
        </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Daypilot AI Full-Stack Server running at http://0.0.0.0:${PORT}`);
});

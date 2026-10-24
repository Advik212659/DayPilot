# Daypilot AI — Full-Stack Web Application

**Daypilot AI** is an intelligent personal AI assistant built with **Node.js/Express (Backend)** and **React/Vite (Frontend)**, ready to run directly in **VS Code** and deploy seamlessly to **Render**.

---

## 🚀 Quick Start in VS Code

### 1. Prerequisites
- **Node.js** v18+ installed on your computer.
- **npm** (comes bundled with Node.js).
- (Optional) A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey). If not provided, Daypilot automatically runs with its built-in local smart engine.

### 2. Open in VS Code
Open the project root directory in VS Code:
```bash
code .
```

### 3. Install All Dependencies
Run from the root directory:
```bash
npm run install-all
```
*(This installs root backend dependencies and client frontend dependencies).*

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your key:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 5. Run the Application
In your VS Code terminal, start both the backend API and frontend React client:

#### Option A: Production / Unified Server (Simplest)
Build the frontend and run the Express server:
```bash
npm run build
npm start
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

#### Option B: Development Mode with Live Hot Reload
Terminal 1 (Backend API):
```bash
npm run server
```
Terminal 2 (React Vite Dev Server):
```bash
npm run client
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Render

Daypilot AI is pre-configured for **Render** with `render.yaml`.

### Method 1: Render Blueprint (1-Click Deployment)
1. Push this project to your GitHub repository.
2. In [Render Dashboard](https://dashboard.render.com/), click **New +** → **Blueprint**.
3. Select your GitHub repository. Render automatically reads `render.yaml`:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Under Environment Variables, add `GEMINI_API_KEY` with your Gemini API key.
5. Click **Apply**. Render will build and deploy your app with a public `https://<your-app>.onrender.com` URL!

### Method 2: Manual Web Service on Render
1. Click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. In the **Environment Variables** tab, add:
   - `GEMINI_API_KEY` = `your_gemini_api_key`
5. Click **Create Web Service**.

---

## 📂 Project Structure

```
├── server/
│   ├── server.js          # Express REST API, Gemini orchestration & tool calling
│   ├── db.js              # Persistent database manager
│   └── daypilot_data.json # Persistent JSON data store
├── client/
│   ├── index.html         # Web HTML entry
│   ├── vite.config.js     # Vite configuration & /api proxy
│   ├── package.json       # React dependencies
│   └── src/
│       ├── main.jsx       # React entry
│       ├── App.jsx        # Master layout & unified state
│       ├── index.css      # Modern Aurora AI design system
│       └── components/
│           ├── Home.jsx           # Dashboard with Daily Briefing
│           ├── Chat.jsx           # AI chat with speech-to-text & TTS
│           ├── Tasks.jsx          # Task manager & priority filters
│           ├── CalendarView.jsx   # Schedule timeline & conflict detection
│           ├── Workspace.jsx      # Projects, Notes, Memories, Automations
│           └── Settings.jsx       # Gemini API key & voice controls
├── render.yaml            # Render Blueprint deployment config
├── package.json           # Root full-stack scripts
├── .env.example           # Environment template
└── README.md              # Documentation
```

---

## 🌟 Core Features Included

1. **Intelligent AI Chat & Action Grounding**: Direct Google Gemini API (`gemini-3.5-flash` / `gemini-3.1-pro-preview`) with tool execution. Asking to add tasks or schedule meetings creates real records.
2. **Personalized Long-Term Memory**: Stores user preferences, routines, and goals, injecting them into prompts. Users can toggle or clear memories anytime.
3. **Tasks & To-Dos**: Full CRUD, priority badges (Urgent, High, Medium, Low), category filters, and search.
4. **Calendar & Conflict Detection**: Interactive date picker with automatic schedule overlap warnings.
5. **Voice Assistant**: Web Speech API for voice recognition (microphone) and SpeechSynthesis for audio readout with adjustable speech rate.
6. **Workspace & Automations**: Projects & milestones, knowledge base notes, and 1-tap automations (Morning Briefing, Meeting Notes to Tasks, Project Breakdown, Weekly Review).
7. **Document Intelligence**: Paste text or notes to extract key takeaways and generate tasks.

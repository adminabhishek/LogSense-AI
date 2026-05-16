# AI Infrastructure Dashboard - Specification

## Project Overview
- **Name**: AI Infrastructure Dashboard
- **Type**: Full-stack observability platform (SaaS-style)
- **Core**: Real-time infrastructure monitoring with AI-powered log analysis
- **Target**: DevOps engineers, SREs, system administrators

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Recharts, Framer Motion, Lucide
- **Backend**: Python FastAPI, psutil, SQLAlchemy, SQLite
- **AI**: OpenAI API / Ollama local models
- **Container**: Docker, docker-compose

## UI/UX Specification

### Color Palette
- **Background Primary**: `#0a0e17` (deep navy)
- **Background Secondary**: `#111827` (charcoal)
- **Background Card**: `#1a2332` (dark slate)
- **Accent Primary**: `#8b5cf6` (purple)
- **Accent Secondary**: `#3b82f6` (blue)
- **Accent Gradient**: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)
- **Success**: `#10b981` (emerald)
- **Warning**: `#f59e0b` (amber)
- **Error**: `#ef4444` (red)
- **Text Primary**: `#f1f5f9` (slate-100)
- **Text Secondary**: `#94a3b8` (slate-400)
- **Border**: `#1e293b` (slate-800)

### Typography
- **Font Family**: Inter (primary), JetBrains Mono (code/numbers)
- **Headings**: 24px/20px/18px/16px (h1-h4)
- **Body**: 14px
- **Small**: 12px
- **Monospace**: 13px (logs, metrics)

### Visual Effects
- **Card Style**: Glassmorphism with backdrop-blur-sm, subtle border glow
- **Shadows**: `0 4px 20px rgba(139, 92, 246, 0.15)`
- **Animations**: Framer Motion for page transitions, card hovers, chart animations
- **Glow Effects**: Purple/blue glow on interactive elements

### Layout Structure
- **Sidebar**: 240px fixed, collapsible to 64px
- **Header**: 64px height with search, notifications, user menu
- **Content**: Fluid, max-width 1600px, padding 24px
- **Grid**: 12-column grid for dashboard cards

### Pages

#### 1. Dashboard Page
- 4-column stat cards: CPU, RAM, Disk, Uptime
- Line chart: CPU/RAM history (last 60 data points)
- Donut chart: Resource distribution
- Recent logs panel (last 10)
- Recent alerts panel (last 5)
- AI summary card with glow effect

#### 2. Logs Page
- Drag-and-drop upload zone (dashed border, gradient)
- Log table with columns: Timestamp, Level, Source, Message
- Filter chips: ERROR, WARNING, INFO, DEBUG
- Search bar with debounce
- Pagination: 25/50/100 per page
- Log summary stats cards
- Source breakdown pie chart

#### 3. AI Analysis Page
- Analysis results card with sections:
  - Summary (AI-generated)
  - Issues found (list)
  - Severity breakdown
  - Root causes
  - Recommendations
- Download report button
- Context panel showing log excerpts

#### 4. Alerts Page
- Active alerts table with severity badges
- Alert history with filters
- Line chart: Alert count over time
- Acknowledge/Resolve actions
- Alert threshold configuration

#### 5. System Details Page
- Info cards: OS, Hostname, Uptime
- CPU details: Model, cores, frequency, temperature
- Memory details: Total, available, used
- GPU info card (if available)
- Network interfaces list
- Running services table
- Software versions list

#### 6. Settings Page
- Theme toggle (dark/light - default dark)
- Refresh interval slider (1-30 seconds)
- Alert thresholds: CPU, RAM, Disk (sliders)
- AI provider dropdown (OpenAI/Ollama)
- API key input (masked)
- Model selection dropdown
- Save/Reset buttons

#### 7. AI Assistant Page
- Chat interface with message bubbles
- System snapshot sidebar
- Suggested prompts chips
- Quick action buttons
- Typing indicator animation

## Backend Specification

### API Endpoints
```
GET  /api/metrics          - Real-time system metrics
GET  /api/metrics/history  - Historical metrics (last hour)
POST /api/logs/upload      - Upload log file
GET  /api/logs             - Get logs with filters
POST /api/logs/analyze     - AI analysis of logs
GET  /api/alerts           - Get alerts
POST /api/alerts/{id}/ack  - Acknowledge alert
POST /api/alerts/{id}/resolve - Resolve alert
GET  /api/system           - System information
GET  /api/settings         - Get settings
PUT  /api/settings         - Update settings
POST /api/chat             - AI chat assistant
```

### AI Service
- OpenAI client with configurable API key
- Ollama client for local models
- Prompt templates for log analysis
- Rate limiting and error handling

## Acceptance Criteria
- [ ] Dashboard shows real-time metrics updating every 5 seconds
- [ ] Log upload accepts .log and .txt files with drag-and-drop
- [ ] AI analysis generates meaningful summaries
- [ ] Alerts trigger when thresholds exceeded
- [ ] All pages render without console errors
- [ ] Docker compose starts all services
- [ ] UI feels premium with animations and glow effects
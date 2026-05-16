# AI Infrastructure Dashboard

A production-grade, full-stack AI-powered infrastructure monitoring dashboard built with React, FastAPI, and modern DevOps practices.

![Dashboard Preview](https://via.placeholder.com/800x400/0a0e17/8b5cf6?text=AI+Infrastructure+Dashboard)

## Features

### Real-time Monitoring
- **CPU Usage** - Live CPU percentage tracking with historical charts
- **Memory Monitoring** - RAM usage, availability, and distribution
- **Disk Usage** - Storage consumption and space management
- **System Uptime** - Server uptime tracking

### Log Management
- **File Upload** - Drag-and-drop .log and .txt file upload
- **Log Parsing** - Automatic log level detection (ERROR, WARNING, INFO, DEBUG)
- **Search & Filter** - Search logs by content, filter by severity
- **Pagination** - Handle large log files with paginated views

### AI-Powered Analysis
- **Log Summarization** - AI-generated summaries of log data
- **Issue Detection** - Automatic identification of problems
- **Root Cause Analysis** - AI-driven root cause identification
- **Recommendations** - Actionable fixes for detected issues

### Alert System
- **Threshold Alerts** - Configurable CPU, RAM, and disk thresholds
- **Severity Levels** - Critical, Warning, and Info alerts
- **Alert History** - Track all past alerts and resolutions
- **Acknowledge/Resolve** - Manage alerts through the UI

### AI Assistant
- **Natural Language Queries** - Ask questions about your infrastructure
- **Context-Aware** - Uses current metrics, logs, and alerts for responses
- **Quick Actions** - Pre-built prompts for common queries

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Python FastAPI** for REST API
- **SQLAlchemy** with SQLite for database
- **psutil** for system monitoring
- **OpenAI** and **Ollama** for AI services

### Infrastructure
- **Docker** for containerization
- **docker-compose** for orchestration

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
cd ai-infra-dashboard

# Start all services
docker-compose up --build

# Access the dashboard
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
```

### Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# OpenAI API (optional - for AI features)
OPENAI_API_KEY=sk-your-api-key-here

# Database (optional - defaults to SQLite)
DATABASE_URL=sqlite:///./ai_infra.db
```

### Settings Page

Configure through the UI at `/settings`:
- **Theme**: Dark/Light mode
- **Refresh Interval**: 1-30 seconds
- **Alert Thresholds**: CPU, RAM, Disk percentages
- **AI Provider**: OpenAI or Ollama
- **Model Selection**: GPT-3.5, GPT-4, or local models

## API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics` | Current system metrics |
| GET | `/api/metrics/history` | Historical metrics data |
| POST | `/api/logs/upload` | Upload log file |
| GET | `/api/logs` | Get filtered logs |
| POST | `/api/logs/analyze` | AI log analysis |
| GET | `/api/alerts` | Get alerts |
| POST | `/api/alerts/{id}/acknowledge` | Acknowledge alert |
| POST | `/api/alerts/{id}/resolve` | Resolve alert |
| GET | `/api/system` | System information |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/chat` | AI chat assistant |

## Project Structure

```
ai-infra-dashboard/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── ai/           # AI service layer
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── monitoring/  # Threshold monitoring
│   │   └── database/     # Database configuration
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/    # API services
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── sample-logs.log
└── README.md
```

## Screenshots

### Dashboard
Real-time metrics with live charts and system status.

### Logs Page
Upload, search, and filter log entries.

### AI Analysis
AI-powered insights and recommendations.

### Alerts
Monitor and manage system alerts.

### AI Assistant
Natural language infrastructure queries.

## Future Improvements

- [ ] WebSocket for real-time updates
- [ ] Multiple alert notification channels (Slack, Email)
- [ ] Export reports to PDF/CSV
- [ ] User authentication and authorization
- [ ] Multi-server support
- [ ] Custom dashboard widgets
- [ ] API rate limiting and caching
- [ ] Grafana/Prometheus integration

## License

MIT License - feel free to use this for learning or commercial projects.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using modern DevOps practices
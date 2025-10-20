# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Root)
```bash
npm install                 # Install frontend dependencies
npm run dev                 # Start Vite dev server (http://localhost:5173)
npm run build              # Build frontend (outputs to dist/)
npm run lint               # Run ESLint
npm run preview            # Preview production build locally
```

### Backend (server/)
```bash
cd server
npm install                 # Install backend dependencies
npm run dev                 # Start backend with hot reload (port 3001)
npm start                   # Start backend in production mode
```

### Docker
```bash
docker compose up -d                    # Build and start container
docker compose down                     # Stop container
docker compose logs -f --tail=50       # View logs
docker compose build                   # Rebuild without starting
docker compose up -d --build           # Rebuild and restart
docker cp <container>:/app/server/data/polls.db ./backup.db  # Backup database
```

### Testing Deployment
```bash
curl -s http://localhost:3001/health   # Check backend health
docker compose ps                       # Check container status
```

## Architecture Overview

### Database Switching Mechanism
The backend uses **conditional database loading** based on the `USE_SQLITE` environment variable:

- **Development (local)**: Uses `database-simple.js` (JSON file storage) by default
- **Production (Docker)**: Uses `database.js` (SQLite via better-sqlite3) when `USE_SQLITE=true`

This approach avoids SQLite native dependency issues during local development on macOS while ensuring production uses proper SQLite persistence.

**Key file**: `server/index.js:14-16`
```javascript
const useSqlite = process.env.USE_SQLITE === 'true';
const dbModule = await import(useSqlite ? './database.js' : './database-simple.js');
```

Both database modules expose the same interface: `createPoll()`, `getPoll()`, `toggleVote()`, `getAllPolls()`.

### API URL Resolution
The frontend uses **environment-aware API URL selection** in `src/utils/api.ts:5-6`:

- **Production**: Uses relative paths (same origin) since backend serves the built frontend
- **Development**: Uses `VITE_API_URL` env var or defaults to `http://localhost:3001`

This prevents CORS issues and hardcoded URLs in production deployments.

### Docker Multi-Stage Build
The Dockerfile uses a **two-stage build**:

1. **Stage 1 (frontend-builder)**: Builds React frontend with Vite
2. **Stage 2**: Sets up Node backend, installs SQLite dependencies (python3, make, g++), copies built frontend, and serves both

In production, the Express server serves the frontend static files from `/app/dist` (see `server/index.js:104-110`).

### Date Chunk System
The calendar voting system works with **4-day date chunks**:

- Users select start dates in the calendar
- Each selection creates a DateChunk spanning 4 consecutive days
- Chunks are stored with unique IDs and associated with votes
- The calendar highlights these chunks for voting

**Key types** in `src/types/index.ts`:
```typescript
interface DateChunk {
  id: string;
  startDate: Date;
  endDate: Date;  // Always startDate + 3 days
}

interface Vote {
  participantName: string;
  dateChunkId: string;
}
```

### State Management
No external state management libraries are used. State is managed via:

- React `useState` hooks for component-level state
- API calls for data persistence
- Poll data is fetched fresh on page load and after vote changes

### Routing Structure
React Router is used with three main routes:
- `/` - Landing page (LandingPage.tsx)
- `/create` - Poll creation interface (CreatePollPage.tsx)
- `/poll/:pollId` - Voting interface (PollPage.tsx)

## Important Implementation Details

### Monday-First Calendar
The calendar component uses **Monday as the first day of the week** (European standard), configured in `src/utils/dateUtils.ts` using `date-fns` options.

### Volume Persistence
Database persistence depends on the volume mount at `/app/server/data`:
- **Docker Compose**: Mounts `./data:/app/server/data`
- **Coolify**: Must configure persistent storage for `/app/server/data`
- Without proper volume mounting, poll data will be lost on container restart

### Poll ID Generation
Polls use short, URL-friendly IDs generated client-side (8 random characters). This enables shareable links like `/poll/abc123xy`.

### Vote Toggle Behavior
Votes use **toggle semantics**: clicking a date chunk adds your vote if absent, removes it if present. The backend handles this in `toggleVote()` method.

### Production vs Development Mode
The app behaves differently based on `NODE_ENV`:
- **Production**: Backend serves frontend static files, uses SQLite
- **Development**: Frontend and backend run separately, uses JSON storage

Always ensure environment variables are set correctly when deploying.

## Common Pitfalls

### better-sqlite3 Installation
On macOS, `better-sqlite3` requires Xcode Command Line Tools. If encountering native build errors:
```bash
xcode-select --install
```

For local development, avoid this by using the JSON storage (don't set `USE_SQLITE=true`).

### Port Conflicts
The backend runs on port 3001. Check for conflicts:
```bash
lsof -ti:3001  # Find process using port 3001
```

### Database Location
In Docker, the database is at `/app/server/data/polls.db` (inside container). On the host, it's at `./data/polls.db` due to volume mount.

### API Connection in Production
If the frontend shows "Failed to load poll" in production, verify:
1. `NODE_ENV=production` is set
2. Frontend build exists at `/app/dist`
3. Backend is serving static files (check logs for static middleware activation)

## Deployment Notes

### Coolify Requirements
When deploying to Coolify:
1. Set Build Pack to "Docker"
2. Set Port to `3001`
3. **Critical**: Add persistent storage volume mapping `/app/server/data`
4. Environment variables are optional (defaults work)

### Database Backups
To backup the database from a running container:
```bash
docker cp <container-name>:/app/server/data/polls.db ./polls-backup-$(date +%Y%m%d).db
```

Or from inside the container:
```bash
cp /app/server/data/polls.db /app/server/data/polls-backup.db
```

### Health Checks
The backend exposes `/health` endpoint returning:
```json
{"status": "ok", "timestamp": 1234567890}
```

Use this for monitoring and Docker health checks (already configured in docker-compose.yml).

## File Organization

```
Root (holiday-scheduler/)
├── src/                     # Frontend React + TypeScript
│   ├── components/          # Reusable UI components (Calendar, etc.)
│   ├── pages/              # Route pages (Landing, Create, Poll)
│   ├── types/              # TypeScript interfaces
│   └── utils/              # API client, date utilities
├── server/                  # Backend Node.js + Express
│   ├── index.js            # Main Express server
│   ├── database.js         # SQLite implementation
│   ├── database-simple.js  # JSON file storage (dev fallback)
│   └── data/               # SQLite database directory (volume-mounted)
├── Dockerfile              # Multi-stage build config
├── docker-compose.yml      # Container orchestration
└── dist/                   # Frontend build output (gitignored, created by build)
```

## Technology Stack Details

### Frontend
- React 18 with TypeScript
- Vite for build tooling and dev server
- Tailwind CSS for styling (configured in tailwind.config.js)
- date-fns for date manipulation
- React Router for client-side routing

### Backend
- Express.js for REST API
- better-sqlite3 for SQLite database (production)
- JSON file storage (development fallback)
- CORS enabled for development

### Infrastructure
- Node 20 Alpine Linux base image
- Multi-stage Docker build
- Volume-mounted database for persistence
- Health check configured for monitoring

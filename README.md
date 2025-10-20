# Holiday Scheduler

A beautiful, minimalistic web application for planning group holidays. Find the perfect dates for your crew with a simple, calendar-based voting system—no sign-ups, no fuss.

## Features

- **Simple Poll Creation**: Set up a holiday poll in seconds
- **Calendar-Based Voting**: Select 4-day date chunks across May-September
- **No Authentication**: Share a link, no accounts needed
- **Real-Time Results**: See vote counts and who's available instantly
- **Mobile-First Design**: Beautiful responsive design that works on all devices
- **Progressive Disclosure**: Clean interface that reveals details on interaction

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast development
- **Tailwind CSS** for beautiful, responsive styling
- **React Router** for navigation
- **date-fns** for date manipulation

### Backend
- **Node.js** with Express.js
- **SQLite** (better-sqlite3) for data persistence
- **CORS** enabled for API access

### Deployment
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Coolify** ready for easy self-hosting

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for deployment)

### Development Setup

1. Clone the repository
```bash
git clone <repository-url>
cd holiday-scheduler
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd server
npm install
cd ..
```

4. Create environment file
```bash
cp .env.example .env
```

5. Start the backend server (in one terminal)
```bash
cd server
npm run dev
```

6. Start the frontend dev server (in another terminal)
```bash
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`

### Production Deployment with Docker

#### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The app will be available at `http://localhost:3001`

#### Deploying to Coolify

1. Push your code to a Git repository (GitHub, GitLab, etc.)

2. In Coolify:
   - Create a new application
   - Select your repository
   - Set build pack to "Docker"
   - Configure the following:
     - Port: `3001`
     - Volume: Mount `/app/server/data` to persist the database

3. Deploy! Coolify will automatically build using the Dockerfile

#### Manual Docker Build

```bash
# Build the image
docker build -t holiday-scheduler .

# Run the container
docker run -d \
  -p 3001:3001 \
  -v $(pwd)/data:/app/server/data \
  --name holiday-scheduler \
  holiday-scheduler

# View logs
docker logs -f holiday-scheduler
```

### Environment Variables

Create a `.env` file based on `.env.example`:

- `VITE_API_URL`: API base URL (default: `http://localhost:3001`)
- `PORT`: Backend server port (default: `3001`)
- `NODE_ENV`: Environment mode (`development` or `production`)

## Usage

### Creating a Poll (The Organizer)

1. Click "Create Your Poll" on the landing page
2. Enter an event title (e.g., "Summer Getaway 2025")
3. Add participant names (comma-separated)
4. Click on dates in the calendar to create 4-day trip options
5. Click "Create Poll & Get Link" to generate a shareable URL

### Voting (The Friends)

1. Open the poll link shared by the organizer
2. Select your name from the dropdown/list
3. Click on the highlighted date ranges to vote
4. Click again to remove your vote
5. See real-time results showing vote counts and who's available

### Key Features

- **4-Day Date Chunks**: Each selection automatically creates a 4-day holiday period
- **Vote Counts**: See the number of votes each date option has received
- **Visual Feedback**: Green rings indicate your votes, numbers show total votes
- **Voter Details**: Click on vote count badges to see who voted for each date
- **Mobile Drawer**: On mobile, participant selection uses a sleek slide-out drawer

## Project Structure

```
holiday-scheduler/
├── src/                      # Frontend source
│   ├── components/
│   │   └── Calendar.tsx      # Multi-month calendar component
│   ├── pages/
│   │   ├── LandingPage.tsx   # Hero page with CTA
│   │   ├── CreatePollPage.tsx # Poll creation interface
│   │   └── PollPage.tsx      # Voting interface
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── utils/
│   │   ├── dateUtils.ts      # Date manipulation utilities
│   │   └── api.ts            # API client
│   ├── App.tsx               # Main app with routing
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles with Tailwind
├── server/                   # Backend source
│   ├── index.js              # Express server
│   ├── database.js           # SQLite database setup
│   ├── package.json          # Backend dependencies
│   └── data/                 # SQLite database (created at runtime)
├── Dockerfile                # Docker build instructions
├── docker-compose.yml        # Docker Compose configuration
└── package.json              # Frontend dependencies
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Troubleshooting

### SQLite Installation Issues on macOS

If you encounter errors installing `better-sqlite3` on macOS, you may need to install Xcode Command Line Tools:

```bash
xcode-select --install
```

Alternatively, you can use Docker for development which avoids this issue entirely:

```bash
docker-compose up
```

### API Connection Issues

If the frontend can't connect to the backend:

1. Ensure the backend is running on port 3001
2. Check that `VITE_API_URL` in `.env` is set correctly
3. In production, the frontend build is served by the backend, so there's no CORS issue

## Future Enhancements

- Email/SMS notifications when new votes are cast
- Export results to calendar apps (Google Calendar, iCal)
- Custom date ranges (not just 4-day chunks)
- Multiple organizers/admin features
- Comments/discussion thread per date option
- Poll expiration dates
- Anonymous voting option
- Results export to CSV/PDF

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

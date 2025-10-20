import express from 'express';
import cors from 'cors';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
mkdirSync(join(__dirname, 'data'), { recursive: true });

// Use SQLite in Docker/production, JSON file storage for local development
const useSqlite = process.env.USE_SQLITE === 'true';
const dbModule = await import(useSqlite ? './database.js' : './database-simple.js');
const pollsDb = dbModule.pollsDb;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Create a new poll
app.post('/api/polls', (req, res) => {
  try {
    const poll = req.body;

    // Validate required fields
    if (!poll.id || !poll.title || !poll.participants || !poll.dateChunks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const createdPoll = pollsDb.createPoll(poll);
    res.status(201).json(createdPoll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Get a poll by ID
app.get('/api/polls/:pollId', (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = pollsDb.getPoll(pollId);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    console.error('Error getting poll:', error);
    res.status(500).json({ error: 'Failed to get poll' });
  }
});

// Toggle a vote
app.post('/api/polls/:pollId/votes', (req, res) => {
  try {
    const { pollId } = req.params;
    const { participantName, dateChunkId } = req.body;

    if (!participantName || !dateChunkId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if poll exists
    const poll = pollsDb.getPoll(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const result = pollsDb.toggleVote(pollId, participantName, dateChunkId);

    // Return updated poll
    const updatedPoll = pollsDb.getPoll(pollId);
    res.json(updatedPoll);
  } catch (error) {
    console.error('Error toggling vote:', error);
    res.status(500).json({ error: 'Failed to toggle vote' });
  }
});

// Get all polls (for admin/debugging)
app.get('/api/polls', (req, res) => {
  try {
    const polls = pollsDb.getAllPolls();
    res.json(polls);
  } catch (error) {
    console.error('Error getting polls:', error);
    res.status(500).json({ error: 'Failed to get polls' });
  }
});

// Serve static files from the frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Holiday Scheduler API running on port ${PORT}`);
  console.log(`📊 Database: ${join(__dirname, 'data', 'polls.db')}`);
});

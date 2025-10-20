import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'data', 'polls.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    participants TEXT NOT NULL,
    date_chunks TEXT NOT NULL,
    blocked_dates TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    date_chunk_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    UNIQUE(poll_id, participant_name, date_chunk_id)
  );

  CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
`);

export const pollsDb = {
  // Create a new poll
  createPoll: (poll) => {
    const stmt = db.prepare(`
      INSERT INTO polls (id, title, participants, date_chunks, blocked_dates, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      poll.id,
      poll.title,
      JSON.stringify(poll.participants),
      JSON.stringify(poll.dateChunks),
      JSON.stringify(poll.blockedDates),
      poll.createdAt
    );

    return poll;
  },

  // Get a poll by ID
  getPoll: (pollId) => {
    const stmt = db.prepare(`
      SELECT * FROM polls WHERE id = ?
    `);

    const poll = stmt.get(pollId);

    if (!poll) return null;

    // Get all votes for this poll
    const votesStmt = db.prepare(`
      SELECT participant_name, date_chunk_id, timestamp
      FROM votes
      WHERE poll_id = ?
    `);

    const votes = votesStmt.all(pollId);

    return {
      id: poll.id,
      title: poll.title,
      participants: JSON.parse(poll.participants),
      dateChunks: JSON.parse(poll.date_chunks),
      blockedDates: JSON.parse(poll.blocked_dates),
      votes: votes.map(v => ({
        participantName: v.participant_name,
        dateChunkId: v.date_chunk_id,
        timestamp: v.timestamp
      })),
      createdAt: poll.created_at
    };
  },

  // Add a vote
  addVote: (pollId, vote) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO votes (poll_id, participant_name, date_chunk_id, timestamp)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(pollId, vote.participantName, vote.dateChunkId, vote.timestamp);
    return vote;
  },

  // Remove a vote
  removeVote: (pollId, participantName, dateChunkId) => {
    const stmt = db.prepare(`
      DELETE FROM votes
      WHERE poll_id = ? AND participant_name = ? AND date_chunk_id = ?
    `);

    stmt.run(pollId, participantName, dateChunkId);
  },

  // Toggle a vote
  toggleVote: (pollId, participantName, dateChunkId) => {
    const checkStmt = db.prepare(`
      SELECT id FROM votes
      WHERE poll_id = ? AND participant_name = ? AND date_chunk_id = ?
    `);

    const existing = checkStmt.get(pollId, participantName, dateChunkId);

    if (existing) {
      pollsDb.removeVote(pollId, participantName, dateChunkId);
      return { action: 'removed' };
    } else {
      pollsDb.addVote(pollId, {
        participantName,
        dateChunkId,
        timestamp: Date.now()
      });
      return { action: 'added' };
    }
  },

  // Get all polls (for admin purposes)
  getAllPolls: () => {
    const stmt = db.prepare(`
      SELECT id, title, created_at FROM polls
      ORDER BY created_at DESC
    `);

    return stmt.all();
  }
};

export default db;

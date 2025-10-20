import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, 'data');
const DB_FILE = join(DATA_DIR, 'polls.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database file if it doesn't exist
if (!existsSync(DB_FILE)) {
  writeFileSync(DB_FILE, JSON.stringify({ polls: {}, votes: {} }), 'utf-8');
}

// Read database
const readDb = () => {
  const data = readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
};

// Write database
const writeDb = (data) => {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

export const pollsDb = {
  // Create a new poll
  createPoll: (poll) => {
    const db = readDb();
    db.polls[poll.id] = {
      id: poll.id,
      title: poll.title,
      participants: poll.participants,
      dateChunks: poll.dateChunks,
      blockedDates: poll.blockedDates,
      createdAt: poll.createdAt,
    };
    writeDb(db);
    return poll;
  },

  // Get a poll by ID
  getPoll: (pollId) => {
    const db = readDb();
    const poll = db.polls[pollId];

    if (!poll) return null;

    // Get votes for this poll
    const votes = Object.values(db.votes)
      .filter(v => v.poll_id === pollId)
      .map(v => ({
        participantName: v.participant_name,
        dateChunkId: v.date_chunk_id,
        timestamp: v.timestamp,
      }));

    return {
      ...poll,
      votes,
    };
  },

  // Add a vote
  addVote: (pollId, vote) => {
    const db = readDb();
    const voteKey = `${pollId}:${vote.participantName}:${vote.dateChunkId}`;

    db.votes[voteKey] = {
      poll_id: pollId,
      participant_name: vote.participantName,
      date_chunk_id: vote.dateChunkId,
      timestamp: vote.timestamp,
    };

    writeDb(db);
    return vote;
  },

  // Remove a vote
  removeVote: (pollId, participantName, dateChunkId) => {
    const db = readDb();
    const voteKey = `${pollId}:${participantName}:${dateChunkId}`;
    delete db.votes[voteKey];
    writeDb(db);
  },

  // Toggle a vote
  toggleVote: (pollId, participantName, dateChunkId) => {
    const db = readDb();
    const voteKey = `${pollId}:${participantName}:${dateChunkId}`;

    if (db.votes[voteKey]) {
      delete db.votes[voteKey];
      writeDb(db);
      return { action: 'removed' };
    } else {
      db.votes[voteKey] = {
        poll_id: pollId,
        participant_name: participantName,
        date_chunk_id: dateChunkId,
        timestamp: Date.now(),
      };
      writeDb(db);
      return { action: 'added' };
    }
  },

  // Get all polls (for admin purposes)
  getAllPolls: () => {
    const db = readDb();
    return Object.values(db.polls).map(poll => ({
      id: poll.id,
      title: poll.title,
      createdAt: poll.createdAt,
    }));
  },
};

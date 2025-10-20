import { Poll, Vote } from '../types';

const STORAGE_KEY = 'holiday-scheduler-polls';

export const storageUtils = {
  // Save a new poll
  savePoll: (poll: Poll): void => {
    const polls = storageUtils.getAllPolls();
    polls[poll.id] = poll;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
  },

  // Get a specific poll by ID
  getPoll: (pollId: string): Poll | null => {
    const polls = storageUtils.getAllPolls();
    const poll = polls[pollId];

    if (!poll) return null;

    // Convert date strings back to Date objects
    return {
      ...poll,
      dateChunks: poll.dateChunks.map(chunk => ({
        ...chunk,
        startDate: new Date(chunk.startDate),
        endDate: new Date(chunk.endDate),
      })),
      blockedDates: (poll.blockedDates || []).map(date => new Date(date)),
    };
  },

  // Get all polls
  getAllPolls: (): Record<string, Poll> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  },

  // Add a vote to a poll
  addVote: (pollId: string, vote: Vote): void => {
    const poll = storageUtils.getPoll(pollId);
    if (!poll) return;

    // Remove any existing vote from this participant for this date chunk
    poll.votes = poll.votes.filter(
      v => !(v.participantName === vote.participantName && v.dateChunkId === vote.dateChunkId)
    );

    // Add the new vote
    poll.votes.push(vote);
    storageUtils.savePoll(poll);
  },

  // Remove a vote
  removeVote: (pollId: string, participantName: string, dateChunkId: string): void => {
    const poll = storageUtils.getPoll(pollId);
    if (!poll) return;

    poll.votes = poll.votes.filter(
      v => !(v.participantName === participantName && v.dateChunkId === dateChunkId)
    );
    storageUtils.savePoll(poll);
  },

  // Toggle a vote (add if doesn't exist, remove if exists)
  toggleVote: (pollId: string, participantName: string, dateChunkId: string): void => {
    const poll = storageUtils.getPoll(pollId);
    if (!poll) return;

    const existingVote = poll.votes.find(
      v => v.participantName === participantName && v.dateChunkId === dateChunkId
    );

    if (existingVote) {
      storageUtils.removeVote(pollId, participantName, dateChunkId);
    } else {
      storageUtils.addVote(pollId, {
        participantName,
        dateChunkId,
        timestamp: Date.now(),
      });
    }
  },

  // Get votes for a specific date chunk
  getVotesForChunk: (poll: Poll, dateChunkId: string): Vote[] => {
    return poll.votes.filter(v => v.dateChunkId === dateChunkId);
  },

  // Get all date chunks voted by a participant
  getParticipantVotes: (poll: Poll, participantName: string): string[] => {
    return poll.votes
      .filter(v => v.participantName === participantName)
      .map(v => v.dateChunkId);
  },
};

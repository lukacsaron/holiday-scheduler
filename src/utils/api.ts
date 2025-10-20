import { Poll, Vote } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export const api = {
  // Create a new poll
  createPoll: async (poll: Poll): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/api/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(poll),
    });

    if (!response.ok) {
      throw new Error('Failed to create poll');
    }

    return response.json();
  },

  // Get a poll by ID
  getPoll: async (pollId: string): Promise<Poll | null> => {
    const response = await fetch(`${API_BASE_URL}/api/polls/${pollId}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to get poll');
    }

    const data = await response.json();

    // Convert date strings back to Date objects
    return {
      ...data,
      dateChunks: data.dateChunks.map((chunk: any) => ({
        ...chunk,
        startDate: new Date(chunk.startDate),
        endDate: new Date(chunk.endDate),
      })),
      blockedDates: data.blockedDates.map((date: string) => new Date(date)),
    };
  },

  // Toggle a vote
  toggleVote: async (
    pollId: string,
    participantName: string,
    dateChunkId: string
  ): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/api/polls/${pollId}/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participantName,
        dateChunkId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle vote');
    }

    const data = await response.json();

    // Convert date strings back to Date objects
    return {
      ...data,
      dateChunks: data.dateChunks.map((chunk: any) => ({
        ...chunk,
        startDate: new Date(chunk.startDate),
        endDate: new Date(chunk.endDate),
      })),
      blockedDates: data.blockedDates.map((date: string) => new Date(date)),
    };
  },

  // Get all polls (for admin)
  getAllPolls: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/api/polls`);

    if (!response.ok) {
      throw new Error('Failed to get polls');
    }

    return response.json();
  },
};

// Helper functions to maintain compatibility with storage utils
export const storageUtils = {
  savePoll: async (poll: Poll): Promise<void> => {
    await api.createPoll(poll);
  },

  getPoll: async (pollId: string): Promise<Poll | null> => {
    return api.getPoll(pollId);
  },

  toggleVote: async (
    pollId: string,
    participantName: string,
    dateChunkId: string
  ): Promise<void> => {
    await api.toggleVote(pollId, participantName, dateChunkId);
  },

  getVotesForChunk: (poll: Poll, dateChunkId: string): Vote[] => {
    return poll.votes.filter((v) => v.dateChunkId === dateChunkId);
  },

  getParticipantVotes: (poll: Poll, participantName: string): string[] => {
    return poll.votes
      .filter((v) => v.participantName === participantName)
      .map((v) => v.dateChunkId);
  },
};

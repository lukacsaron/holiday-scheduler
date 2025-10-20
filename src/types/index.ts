// Core types for the holiday scheduler app

export interface DateChunk {
  id: string;
  startDate: Date;
  endDate: Date; // Will be startDate + 3 days
}

export interface Vote {
  participantName: string;
  dateChunkId: string;
  timestamp: number;
}

export interface Poll {
  id: string;
  title: string;
  participants: string[];
  dateChunks: DateChunk[];
  blockedDates: Date[]; // Dates that are marked as unavailable
  votes: Vote[];
  createdAt: number;
}

export interface PollFormData {
  title: string;
  participants: string[];
  selectedChunks: DateChunk[];
}

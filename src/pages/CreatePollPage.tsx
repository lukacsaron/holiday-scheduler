import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import { DateChunk, Poll } from '../types';
import { api } from '../utils/api';

type SelectionMode = 'chunks' | 'blocked';

const CreatePollPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [participantsText, setParticipantsText] = useState('');
  const [selectedChunks, setSelectedChunks] = useState<DateChunk[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('chunks');
  const [showSuccess, setShowSuccess] = useState(false);
  const [pollUrl, setPollUrl] = useState('');

  const parseParticipants = (text: string): string[] => {
    return text
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
  };

  const handleChunkToggle = (chunk: DateChunk) => {
    setSelectedChunks(prev => {
      const exists = prev.some(c => c.id === chunk.id);
      if (exists) {
        return prev.filter(c => c.id !== chunk.id);
      } else {
        return [...prev, chunk];
      }
    });
  };

  const handleBlockedDateToggle = (date: Date) => {
    setBlockedDates(prev => {
      const exists = prev.some(d =>
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
      if (exists) {
        return prev.filter(d =>
          !(d.getFullYear() === date.getFullYear() &&
            d.getMonth() === date.getMonth() &&
            d.getDate() === date.getDate())
        );
      } else {
        return [...prev, date];
      }
    });
  };

  const handleCreatePoll = async () => {
    const participants = parseParticipants(participantsText);

    if (!title.trim()) {
      alert('Please enter an event title');
      return;
    }

    if (participants.length === 0) {
      alert('Please enter at least one participant');
      return;
    }

    if (selectedChunks.length === 0) {
      alert('Please select at least one 4-day date range');
      return;
    }

    try {
      // Generate unique poll ID
      const pollId = `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const poll: Poll = {
        id: pollId,
        title: title.trim(),
        participants,
        dateChunks: selectedChunks,
        blockedDates,
        votes: [],
        createdAt: Date.now(),
      };

      await api.createPoll(poll);

      // Generate shareable URL
      const url = `${window.location.origin}/poll/${pollId}`;
      setPollUrl(url);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll. Please try again.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pollUrl);
    alert('Link copied to clipboard!');
  };

  const handleGoToPoll = () => {
    const pollId = pollUrl.split('/').pop();
    navigate(`/poll/${pollId}`);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="card text-center space-y-6 animate-scale-in">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Poll Created!</h2>
              <p className="text-gray-600">Share this link with your friends</p>
            </div>

            {/* URL Display */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <code className="text-sm text-gray-700 break-all">{pollUrl}</code>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={handleCopyLink} className="btn-primary">
                <span className="flex items-center gap-2 justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Link
                </span>
              </button>

              <button onClick={handleGoToPoll} className="btn-secondary">
                View Poll
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 text-sm underline"
            >
              Create another poll
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Your Poll
          </h1>
          <p className="text-gray-600 mt-2">
            Set up your group trip in three easy steps
          </p>
        </div>

        <div className="space-y-8">
          {/* Step 1: Event Details */}
          <div className="card animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Summer Getaway 2025"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Participants (comma-separated)
                </label>
                <textarea
                  value={participantsText}
                  onChange={(e) => setParticipantsText(e.target.value)}
                  placeholder="e.g., Alex, Ben, Charlie, Dana, Emma, Frank, Grace, Henry, Ivy, Jack, Kate, Leo"
                  rows={3}
                  className="input resize-none"
                />
                {participantsText && (
                  <p className="text-sm text-gray-500 mt-2">
                    {parseParticipants(participantsText).length} participants
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Select Dates */}
          <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Select Date Options & Block Dates</h2>
            </div>

            {/* Mode Toggle */}
            <div className="mb-6">
              <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                <button
                  onClick={() => setSelectionMode('chunks')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    selectionMode === 'chunks'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Select Date Options
                </button>
                <button
                  onClick={() => setSelectionMode('blocked')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    selectionMode === 'blocked'
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Block Dates
                </button>
              </div>
            </div>

            {selectionMode === 'chunks' ? (
              <>
                <p className="text-gray-600 mb-6">
                  Click on any date to create a 4-day trip option. Click multiple times to add several options.
                </p>

                {selectedChunks.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-2">
                      Selected: {selectedChunks.length} date option{selectedChunks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Click on individual dates that are unavailable. These will be marked with an X and shown to voters.
                </p>

                {blockedDates.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg">
                    <p className="font-semibold text-red-900 mb-2">
                      Blocked: {blockedDates.length} date{blockedDates.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </>
            )}

            <Calendar
              mode="create"
              selectedChunks={selectionMode === 'chunks' ? selectedChunks : []}
              onChunkToggle={selectionMode === 'chunks' ? handleChunkToggle : undefined}
              blockedDates={blockedDates}
              onBlockedDateToggle={selectionMode === 'blocked' ? handleBlockedDateToggle : undefined}
            />
          </div>

          {/* Step 3: Create Poll */}
          <div className="text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <button
              onClick={handleCreatePoll}
              className="btn-primary text-lg px-12 py-4"
            >
              Create Poll & Get Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePollPage;

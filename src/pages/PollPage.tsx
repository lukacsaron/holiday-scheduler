import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import { Poll } from '../types';
import { api, storageUtils } from '../utils/api';
import { formatChunk } from '../utils/dateUtils';

const PollPage = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [showParticipantDrawer, setShowParticipantDrawer] = useState(false);

  useEffect(() => {
    if (!pollId) {
      navigate('/');
      return;
    }

    const loadPoll = async () => {
      try {
        const loadedPoll = await api.getPoll(pollId);
        if (!loadedPoll) {
          alert('Poll not found!');
          navigate('/');
          return;
        }
        setPoll(loadedPoll);
      } catch (error) {
        console.error('Error loading poll:', error);
        alert('Failed to load poll. Please try again.');
        navigate('/');
      }
    };

    loadPoll();
  }, [pollId, navigate]);

  const handleVoteToggle = async (chunkId: string) => {
    if (!pollId || !selectedParticipant) return;

    try {
      const updatedPoll = await api.toggleVote(pollId, selectedParticipant, chunkId);
      setPoll(updatedPoll);
    } catch (error) {
      console.error('Error toggling vote:', error);
      alert('Failed to update vote. Please try again.');
    }
  };

  const handleSelectParticipant = (name: string) => {
    setSelectedParticipant(name);
    setShowParticipantDrawer(false);
  };

  const getVotedChunks = (): string[] => {
    if (!poll || !selectedParticipant) return [];
    return storageUtils.getParticipantVotes(poll, selectedParticipant);
  };

  const getSortedChunksByVotes = () => {
    if (!poll) return [];

    return [...poll.dateChunks]
      .map(chunk => ({
        chunk,
        voteCount: storageUtils.getVotesForChunk(poll, chunk.id).length,
        voters: storageUtils.getVotesForChunk(poll, chunk.id).map(v => v.participantName),
      }))
      .sort((a, b) => b.voteCount - a.voteCount);
  };

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  const votedChunks = getVotedChunks();
  const sortedChunks = getSortedChunksByVotes();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{poll.title}</h1>
        </div>

        {/* Participant Selection - More Prominent */}
        <div className="card mb-6 animate-slide-up border-4 border-blue-500 shadow-2xl">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              👋 Who are you?
            </h2>
            {selectedParticipant ? (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-bold rounded-xl shadow-lg">
                  {selectedParticipant}
                </div>
                <div>
                  <button
                    onClick={() => setSelectedParticipant('')}
                    className="text-gray-600 hover:text-gray-900 underline"
                  >
                    Change name
                  </button>
                </div>
                {votedChunks.length > 0 && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                    <p className="text-lg text-green-800">
                      ✅ You've voted for <span className="font-bold text-green-600">{votedChunks.length}</span> date option{votedChunks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xl text-gray-600">
                  Select your name to start voting
                </p>
                <div className="flex justify-center">
                  {/* Desktop: Dropdown */}
                  <select
                    value={selectedParticipant}
                    onChange={(e) => setSelectedParticipant(e.target.value)}
                    className="input text-lg py-4 px-6 max-w-md hidden md:block"
                  >
                    <option value="">Choose your name...</option>
                    {poll.participants.map(name => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  {/* Mobile: Button to open drawer */}
                  <button
                    onClick={() => setShowParticipantDrawer(true)}
                    className="btn-primary text-xl px-8 py-4 md:hidden"
                  >
                    Select Your Name
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions & Legend */}
        {selectedParticipant && (
          <div className="space-y-4 mb-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Tip:</span> Click on any highlighted date range to vote. Click again to remove your vote.
              </p>
            </div>

            {/* Color Legend */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Legend:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-green-600 flex-shrink-0"></div>
                  <span className="font-semibold text-green-700">Your votes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-300 flex-shrink-0"></div>
                  <span className="text-gray-700">Others voted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-50 to-gray-100 border border-blue-300 flex-shrink-0"></div>
                  <span className="text-gray-700">Available (no votes)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Blocked dates</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Calendar
            mode="vote"
            poll={poll}
            selectedParticipant={selectedParticipant}
            onVoteToggle={handleVoteToggle}
          />
        </div>

        {/* Voting Results - Moved Below Calendar */}
        {sortedChunks.length > 0 && (
          <div className="card mt-8 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">📊 Current Results</h2>

            {/* Summary by Date */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold text-gray-800">By Date</h3>
              {sortedChunks.map(({ chunk, voteCount, voters }) => (
                <div
                  key={chunk.id}
                  className={`p-4 rounded-xl transition-all ${voteCount > 0
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300'
                      : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-lg font-bold text-gray-900">
                        {formatChunk(chunk)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-4xl font-bold ${voteCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {voteCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        vote{voteCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  {voters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {voters.map(voter => (
                        <span
                          key={voter}
                          className="px-3 py-1 bg-white border-2 border-green-300 text-green-700 rounded-full text-sm font-semibold"
                        >
                          ✓ {voter}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary by Participant */}
            <div className="border-t-2 border-gray-200 pt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">By Participant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {poll.participants.map(participant => {
                  const participantVotes = poll.votes.filter(v => v.participantName === participant);
                  const votedDates = participantVotes.map(v => {
                    const chunk = poll.dateChunks.find(c => c.id === v.dateChunkId);
                    return chunk ? formatChunk(chunk) : '';
                  }).filter(Boolean);

                  return (
                    <div
                      key={participant}
                      className={`p-4 rounded-lg ${votedDates.length > 0
                          ? 'bg-blue-50 border-2 border-blue-300'
                          : 'bg-gray-50 border-2 border-gray-200'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${votedDates.length > 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                        <div className="font-bold text-gray-900">{participant}</div>
                      </div>
                      {votedDates.length > 0 ? (
                        <div className="text-sm space-y-1">
                          {votedDates.map((date, idx) => (
                            <div key={idx} className="text-gray-700">
                              • {date}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          No votes yet
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate(`/poll/${pollId}/edit`)}
            className="btn-secondary inline-flex items-center gap-2"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Poll
          </button>
          <button
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              alert('Poll link copied to clipboard!');
            }}
            className="btn-secondary inline-flex items-center gap-2"
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Poll Link
          </button>
        </div>
      </div>

      {/* Mobile Participant Drawer */}
      {showParticipantDrawer && (
        <>
          <div
            className="drawer-overlay md:hidden"
            onClick={() => setShowParticipantDrawer(false)}
          />
          <div className="drawer md:hidden" style={{ transform: 'translateX(0)' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Select Your Name</h3>
                <button
                  onClick={() => setShowParticipantDrawer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                {poll.participants.map(name => (
                  <button
                    key={name}
                    onClick={() => handleSelectParticipant(name)}
                    className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PollPage;

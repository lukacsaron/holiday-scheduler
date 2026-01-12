import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Calendar from '../components/Calendar';
import { DateChunk } from '../types';
import { api } from '../utils/api';

type SelectionMode = 'chunks' | 'blocked';

const EditPollPage = () => {
    const navigate = useNavigate();
    const { pollId } = useParams<{ pollId: string }>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [participantsText, setParticipantsText] = useState('');
    const [selectedChunks, setSelectedChunks] = useState<DateChunk[]>([]);
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('chunks');

    useEffect(() => {
        const loadPoll = async () => {
            if (!pollId) return;

            try {
                const poll = await api.getPoll(pollId);
                if (poll) {
                    setTitle(poll.title);
                    setParticipantsText(poll.participants.join(', '));
                    setSelectedChunks(poll.dateChunks);
                    setBlockedDates(poll.blockedDates);
                } else {
                    alert('Poll not found');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error loading poll:', error);
                alert('Failed to load poll');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        loadPoll();
    }, [pollId, navigate]);

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

    const handleSave = async () => {
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

        setSaving(true);

        try {
            await api.updatePoll(pollId!, {
                title: title.trim(),
                participants,
                dateChunks: selectedChunks,
                blockedDates,
            });

            navigate(`/poll/${pollId}`);
        } catch (error) {
            console.error('Error updating poll:', error);
            alert('Failed to update poll. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading poll...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center animate-fade-in">
                    <button
                        onClick={() => navigate(`/poll/${pollId}`)}
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
                        Back to Poll
                    </button>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Edit Poll
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Update your poll settings below
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Event Details */}
                    <div className="card animate-slide-up">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Details</h2>

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
                                    placeholder="e.g., Alex, Ben, Charlie"
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

                    {/* Date Selection */}
                    <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Date Options & Blocked Dates</h2>

                        {/* Mode Toggle */}
                        <div className="mb-6">
                            <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                                <button
                                    onClick={() => setSelectionMode('chunks')}
                                    className={`px-6 py-2 rounded-md font-semibold transition-all ${selectionMode === 'chunks'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Date Options ({selectedChunks.length})
                                </button>
                                <button
                                    onClick={() => setSelectionMode('blocked')}
                                    className={`px-6 py-2 rounded-md font-semibold transition-all ${selectionMode === 'blocked'
                                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Block Dates ({blockedDates.length})
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6">
                            {selectionMode === 'chunks'
                                ? 'Click on any date to add/remove a 4-day trip option.'
                                : 'Click on dates to mark them as blocked.'}
                        </p>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                            <p className="text-amber-800 text-sm">
                                <strong>Note:</strong> Existing votes are preserved when you change dates. They'll be hidden if their date option is removed.
                            </p>
                        </div>

                        <Calendar
                            mode="create"
                            selectedChunks={selectionMode === 'chunks' ? selectedChunks : []}
                            onChunkToggle={selectionMode === 'chunks' ? handleChunkToggle : undefined}
                            blockedDates={blockedDates}
                            onBlockedDateToggle={selectionMode === 'blocked' ? handleBlockedDateToggle : undefined}
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <button
                            onClick={() => navigate(`/poll/${pollId}`)}
                            className="btn-secondary text-lg px-8 py-3"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary text-lg px-12 py-3 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPollPage;

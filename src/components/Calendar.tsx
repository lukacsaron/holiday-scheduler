import { useState } from 'react';
import { format } from 'date-fns';
import { DateChunk, Poll } from '../types';
import {
  getSummerMonths,
  getDaysInMonth,
  getDayOfWeek,
  isDateInChunk,
  createDateChunk,
  canCreateChunkFromDate,
  isSameDayUtil,
  formatChunk,
} from '../utils/dateUtils';
import { storageUtils } from '../utils/api';
import { getEventsForDate, getPrimaryEventType } from '../utils/events';

interface CalendarProps {
  mode: 'create' | 'vote';
  selectedChunks?: DateChunk[];
  onChunkToggle?: (chunk: DateChunk) => void;
  poll?: Poll;
  selectedParticipant?: string;
  onVoteToggle?: (chunkId: string) => void;
  blockedDates?: Date[];
  onBlockedDateToggle?: (date: Date) => void;
}

const Calendar = ({
  mode,
  selectedChunks = [],
  onChunkToggle,
  poll,
  selectedParticipant,
  onVoteToggle,
  blockedDates = [],
  onBlockedDateToggle,
}: CalendarProps) => {
  const [showVotersFor, setShowVotersFor] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);

  const months = getSummerMonths();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get blocked dates from poll if in vote mode, or from props if in create mode
  const effectiveBlockedDates = poll?.blockedDates || blockedDates;

  const isDateBlocked = (date: Date): boolean => {
    return effectiveBlockedDates.some(blockedDate => isSameDayUtil(blockedDate, date));
  };

  const chunkContainsBlockedDate = (chunk: DateChunk): boolean => {
    const chunkDays = [];
    for (let i = 0; i < 4; i++) {
      const day = new Date(chunk.startDate);
      day.setDate(day.getDate() + i);
      chunkDays.push(day);
    }
    return chunkDays.some(day => isDateBlocked(day));
  };

  const handleDateClick = (date: Date) => {
    if (mode === 'create') {
      // If in blocked date mode, toggle blocked status
      if (onBlockedDateToggle) {
        onBlockedDateToggle(date);
        return;
      }

      // Otherwise, handle chunk selection
      if (!canCreateChunkFromDate(date)) return;

      const newChunk = createDateChunk(date);
      if (chunkContainsBlockedDate(newChunk)) {
        alert('Cannot create a date range that includes blocked dates!');
        return;
      }

      const exists = selectedChunks.some(c => c.id === newChunk.id);

      if (exists) {
        // Remove chunk
        onChunkToggle?.(newChunk);
      } else {
        // Add chunk
        onChunkToggle?.(newChunk);
      }
    } else if (mode === 'vote' && selectedParticipant && poll) {
      // Find which chunk this date belongs to
      const chunk = poll.dateChunks.find(c => isDateInChunk(date, c));
      if (chunk) {
        onVoteToggle?.(chunk.id);
      }
    }
  };

  const isDateSelected = (date: Date): boolean => {
    if (mode === 'create') {
      return selectedChunks.some(chunk => isDateInChunk(date, chunk));
    } else if (mode === 'vote' && poll) {
      return poll.dateChunks.some(chunk => isDateInChunk(date, chunk));
    }
    return false;
  };

  const isDateInVotedChunk = (date: Date): boolean => {
    if (mode === 'vote' && poll && selectedParticipant) {
      const votedChunkIds = storageUtils.getParticipantVotes(poll, selectedParticipant);
      return poll.dateChunks.some(
        chunk => votedChunkIds.includes(chunk.id) && isDateInChunk(date, chunk)
      );
    }
    return false;
  };

  const getChunkForDate = (date: Date): DateChunk | undefined => {
    if (mode === 'create') {
      return selectedChunks.find(chunk => isDateInChunk(date, chunk));
    } else if (poll) {
      return poll.dateChunks.find(chunk => isDateInChunk(date, chunk));
    }
  };

  const getVoteCountForChunk = (chunkId: string): number => {
    if (!poll) return 0;
    return storageUtils.getVotesForChunk(poll, chunkId).length;
  };

  const getVotersForChunk = (chunkId: string): string[] => {
    if (!poll) return [];
    return storageUtils.getVotesForChunk(poll, chunkId).map(v => v.participantName);
  };

  const isChunkStart = (date: Date): boolean => {
    const chunk = getChunkForDate(date);
    return chunk ? isSameDayUtil(chunk.startDate, date) : false;
  };

  const renderDay = (date: Date) => {
    const blocked = isDateBlocked(date);
    const isSelected = isDateSelected(date);
    const isVoted = isDateInVotedChunk(date);
    const isStart = isChunkStart(date);
    const chunk = getChunkForDate(date);
    const voteCount = chunk ? getVoteCountForChunk(chunk.id) : 0;

    // Event markers
    const events = getEventsForDate(date);
    const primaryEventType = getPrimaryEventType(date);

    // Check if others (not the current user) have voted for this chunk
    const hasOtherVotes = chunk && poll && selectedParticipant
      ? storageUtils.getVotesForChunk(poll, chunk.id)
        .some(v => v.participantName !== selectedParticipant)
      : false;

    // In create mode with blocked date toggle enabled, all dates are clickable
    // Otherwise, blocked dates are not clickable
    const isClickable =
      (mode === 'create' && onBlockedDateToggle) ||
      (!blocked &&
        ((mode === 'create' && canCreateChunkFromDate(date)) ||
          (mode === 'vote' && chunk !== undefined && selectedParticipant)));

    // Determine background color based on state
    let bgClass = 'bg-white';
    if (blocked) {
      bgClass = 'bg-gray-200 line-through text-gray-500';
    } else if (isVoted) {
      // User's own vote - bright green background
      bgClass = 'bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold';
    } else if (hasOtherVotes && mode === 'vote') {
      // Others have voted - light blue tint
      bgClass = 'bg-gradient-to-br from-blue-100 to-purple-100';
    } else if (isSelected) {
      // Available chunk but no votes yet - subtle gradient
      bgClass = 'bg-gradient-to-br from-gray-50 to-gray-100 border border-blue-300';
    }

    // Event ring styling (layered on top of other states)
    const eventClass = primaryEventType === 'holiday'
      ? 'event-holiday'
      : primaryEventType === 'festival'
        ? 'event-festival'
        : '';

    return (
      <div
        key={date.toISOString()}
        onClick={() => isClickable && handleDateClick(date)}
        className={`
          calendar-day relative transition-all duration-200
          ${bgClass}
          ${eventClass}
          ${isClickable ? 'chunk-hoverable cursor-pointer hover:scale-105' : 'cursor-default opacity-50'}
          ${isStart && mode === 'vote' ? 'rounded-l-lg' : ''}
        `}
        title={events.length > 0 ? events.map(e => `${e.emoji || ''} ${e.name}`).join(', ') : undefined}
      >
        {blocked ? (
          <div className="relative z-10 flex items-center justify-center">
            <span className="line-through text-gray-500">{format(date, 'd')}</span>
            <svg
              className="absolute w-4 h-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        ) : (
          <>
            <span className="relative z-10">{format(date, 'd')}</span>
            {/* Event emoji indicator */}
            {events.length > 0 && (
              <span className="event-marker">
                {events[0].emoji}
              </span>
            )}
          </>
        )}

        {/* Vote count badge for chunk start */}
        {mode === 'vote' && isStart && chunk && voteCount > 0 && (
          <div
            className="absolute -top-2 -right-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer z-20"
            onClick={(e) => {
              e.stopPropagation();
              const badge = e.currentTarget;
              const container = badge.closest('.w-full.relative');
              if (container) {
                const badgeRect = badge.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                setTooltipPosition({
                  top: badgeRect.bottom - containerRect.top + 8,
                  left: badgeRect.left - containerRect.left
                });
              }
              setShowVotersFor(showVotersFor === chunk.id ? null : chunk.id);
            }}
          >
            {voteCount}
          </div>
        )}
      </div>
    );
  };

  const renderMonth = (monthDate: Date) => {
    const days = getDaysInMonth(monthDate);
    const firstDayOfWeekRaw = getDayOfWeek(days[0]);
    // Convert Sunday=0 to Monday-first week (Monday=0, Sunday=6)
    const firstDayOfWeek = firstDayOfWeekRaw === 0 ? 6 : firstDayOfWeekRaw - 1;

    return (
      <div
        key={monthDate.toISOString()}
        className="card mb-6 last:mb-0 animate-slide-up"
      >
        {/* Month header */}
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          {format(monthDate, 'MMMM yyyy')}
        </h3>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day" />
          ))}

          {/* Days */}
          {days.map(renderDay)}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full relative">
      {/* Event Legend */}
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-center text-sm">
        <div className="legend-item">
          <div className="legend-dot ring-2 ring-amber-400 bg-amber-50" />
          <span>🇭🇺 National Holiday</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot ring-2 ring-purple-400 bg-purple-50" />
          <span>🎭 Festival</span>
        </div>
      </div>

      {/* Desktop: 2-column grid for months */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-6">
        {months.map(renderMonth)}
      </div>

      {/* Mobile: Single column */}
      <div className="md:hidden space-y-6">
        {months.map(renderMonth)}
      </div>

      {/* Voters tooltip - rendered outside grid to avoid z-index issues */}
      {showVotersFor && tooltipPosition && poll && (
        <>
          {/* Overlay to close tooltip */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => {
              setShowVotersFor(null);
              setTooltipPosition(null);
            }}
          />
          {/* Tooltip */}
          <div
            className="absolute z-[101] bg-white text-gray-900 text-sm rounded-lg px-4 py-3 shadow-2xl border-2 border-gray-800 whitespace-nowrap"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              backgroundColor: '#ffffff',
              opacity: 1
            }}
          >
            {(() => {
              const chunk = poll.dateChunks.find(c => c.id === showVotersFor);
              if (!chunk) return null;
              return (
                <>
                  <div className="font-bold mb-2 text-gray-900">{formatChunk(chunk)}</div>
                  <div className="space-y-1.5">
                    {getVotersForChunk(chunk.id).map(name => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="font-medium text-gray-900">{name}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;

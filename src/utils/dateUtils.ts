import { addDays, format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { DateChunk } from '../types';

// Generate a unique ID for a date chunk
export const generateChunkId = (startDate: Date): string => {
  return `chunk-${format(startDate, 'yyyy-MM-dd')}`;
};

// Create a 4-day date chunk starting from the given date
export const createDateChunk = (startDate: Date): DateChunk => {
  return {
    id: generateChunkId(startDate),
    startDate,
    endDate: addDays(startDate, 3),
  };
};

// Check if a date is within a date chunk
export const isDateInChunk = (date: Date, chunk: DateChunk): boolean => {
  const dateTime = date.getTime();
  return dateTime >= chunk.startDate.getTime() && dateTime <= chunk.endDate.getTime();
};

// Check if two date chunks overlap
export const chunksOverlap = (chunk1: DateChunk, chunk2: DateChunk): boolean => {
  return (
    chunk1.startDate <= chunk2.endDate &&
    chunk2.startDate <= chunk1.endDate
  );
};

// Get all months for the summer period (July - November)
export const getSummerMonths = (year: number = 2026): Date[] => {
  return [
    new Date(year, 6, 1),  // July
    new Date(year, 7, 1),  // August
    new Date(year, 8, 1),  // September
    new Date(year, 9, 1),  // October
    new Date(year, 10, 1), // November
  ];
};

// Get all days in a month
export const getDaysInMonth = (monthDate: Date): Date[] => {
  return eachDayOfInterval({
    start: startOfMonth(monthDate),
    end: endOfMonth(monthDate),
  });
};

// Get the day of week (0 = Sunday, 6 = Saturday)
export const getDayOfWeek = (date: Date): number => {
  return getDay(date);
};

// Format a date chunk for display
export const formatChunk = (chunk: DateChunk): string => {
  const startMonth = format(chunk.startDate, 'MMM');
  const endMonth = format(chunk.endDate, 'MMM');

  if (startMonth === endMonth) {
    return `${format(chunk.startDate, 'MMM d')}-${format(chunk.endDate, 'd, yyyy')}`;
  } else {
    return `${format(chunk.startDate, 'MMM d')} - ${format(chunk.endDate, 'MMM d, yyyy')}`;
  }
};

// Check if a date chunk can be created starting from a specific date
// (i.e., ensure all 4 days are within the allowed periods)
export const canCreateChunkFromDate = (startDate: Date): boolean => {
  const endDate = addDays(startDate, 3);

  // Check start date criteria
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();

  // Logic: 
  // 1. If July (6), must be 15th or later
  // 2. If Aug-Oct (7-9), any day is fine
  // 3. If Nov (10), any day is fine (though typically we might want to check if the chunk ENDS in Nov too)

  // The user requirement said: "Remove June and July, add October and November" then "2nd half of July can stay".
  // Assuming "add October and November" means full months.

  // Check if date is valid start date
  const isValidStartDate =
    (startMonth === 6 && startDay >= 15) ||
    (startMonth >= 7 && startMonth <= 10);

  if (!isValidStartDate) return false;

  // Also enable strict checking that end date doesn't exceed bounds if needed, 
  // but typically 'canCreateChunk' just checks if the start date initiates a valid block.
  // However, usually we want the whole chunk to be valid. The previous code checked start and end month.
  // Previous: startMonth >= 5 && startMonth <= 8 && endMonth >= 5 && endMonth <= 8;

  const endMonth = endDate.getMonth();

  // We need to ensure the end date doesn't go beyond November.
  // Since our valid start range allows up to Nov 30, a chunk starting Nov 30 ends in Dec.
  // We should probably ensure the generated chunk stays within the allowable year/season if strict.
  // Given previous code: endMonth <= 8 (Sept). 
  // I will enforce endMonth <= 10 (Nov).

  return endMonth <= 10;
};

// Check if two dates are the same day
export const isSameDayUtil = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

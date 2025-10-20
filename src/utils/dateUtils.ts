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

// Get all months for the summer period (June - September)
export const getSummerMonths = (year: number = 2026): Date[] => {
  return [
    new Date(year, 5, 1),  // June
    new Date(year, 6, 1),  // July
    new Date(year, 7, 1),  // August
    new Date(year, 8, 1),  // September
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
// (i.e., ensure all 4 days are within the summer months)
export const canCreateChunkFromDate = (startDate: Date): boolean => {
  const endDate = addDays(startDate, 3);

  // Check if both start and end are within June-September
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();

  return startMonth >= 5 && startMonth <= 8 && endMonth >= 5 && endMonth <= 8;
};

// Check if two dates are the same day
export const isSameDayUtil = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

// Pre-defined events for the calendar (holidays, festivals, etc.)
// These are informational annotations - dates remain fully available for voting

export type EventType = 'holiday' | 'festival';

export interface CalendarEvent {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    type: EventType;
    emoji?: string; // Optional emoji for visual flair
}

// 2026 events configuration
export const PRESET_EVENTS: CalendarEvent[] = [
    {
        id: 'national-holiday-aug',
        name: 'National Holiday',
        startDate: new Date(2026, 7, 20), // Aug 20
        endDate: new Date(2026, 7, 21),   // Aug 21
        type: 'holiday',
        emoji: '🇭🇺',
    },
    {
        id: 'national-holiday-oct',
        name: 'National Holiday',
        startDate: new Date(2026, 9, 23), // Oct 23
        endDate: new Date(2026, 9, 23),   // Oct 23
        type: 'holiday',
        emoji: '🇭🇺',
    },
    {
        id: 'muveszetek-volgye',
        name: 'Művészetek Völgye',
        startDate: new Date(2026, 6, 24), // July 24
        endDate: new Date(2026, 7, 2),    // Aug 02
        type: 'festival',
        emoji: '🎭',
    },
];

// Check if a date falls within any event
export const getEventsForDate = (date: Date): CalendarEvent[] => {
    return PRESET_EVENTS.filter(event => {
        const dateTime = date.getTime();
        // Normalize dates to start of day for comparison
        const start = new Date(event.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(event.endDate);
        end.setHours(23, 59, 59, 999);

        return dateTime >= start.getTime() && dateTime <= end.getTime();
    });
};

// Check if a date has any events
export const hasEvents = (date: Date): boolean => {
    return getEventsForDate(date).length > 0;
};

// Get event type priority (holiday > festival for styling)
export const getPrimaryEventType = (date: Date): EventType | null => {
    const events = getEventsForDate(date);
    if (events.length === 0) return null;

    // Prioritize holidays over festivals
    const holiday = events.find(e => e.type === 'holiday');
    if (holiday) return 'holiday';

    return events[0].type;
};

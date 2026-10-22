export const EVENTS = {
  wedding: { year: 2027, month: 1, day: 19, label: 'wedding' },
  reception: { year: 2027, month: 1, day: 21, label: 'reception' },
};
export function eventDate(event, offset = 0) {
  return new Date(Date.UTC(event.year, event.month - 1, event.day + offset));
}
export function formatEvent(event, options) {
  return eventDate(event).toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
}

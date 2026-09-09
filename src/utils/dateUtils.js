// Date and Time Formatting Utilities

/**
 * Format live clock: "3:41:22 PM · Tuesday, Sep 8, 2026"
 */
export function formatLiveClock(date = new Date()) {
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const weekdayStr = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();

  return `${timeStr} · ${weekdayStr}, ${monthStr} ${day}, ${year}`;
}

/**
 * Format timestamp with Weekday + Date + Time: "Tue, Sep 8, 2026 — 02:36 PM"
 */
export function formatDateTimeWithWeekday(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '—';

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${weekday}, ${month} ${day}, ${year} — ${timeStr}`;
}

/**
 * Format time only (for Records view created time): "02:36:12 PM"
 */
export function formatTimeOnly(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '—';

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Format duration seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
    return '00:00';
  }
  const secs = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format date string YYYY-MM-DD into "Tuesday, Sep 8, 2026"
 */
export function formatDateStringWithWeekday(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return dateStr;

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  return `${weekday}, ${monthName} ${day}, ${year}`;
}

/**
 * Format date string YYYY-MM-DD into short weekday "Tue, Sep 8"
 */
export function formatShortDateStringWithWeekday(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return dateStr;

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  return `${weekday}, ${monthName} ${day}`;
}

/**
 * Get today's YYYY-MM-DD string in local timezone
 */
export function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a timestamp falls within a YYYY-MM-DD date range (inclusive)
 */
export function isTimestampInDateRange(timestamp, startDateStr, endDateStr) {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return false;

  const start = startDateStr ? new Date(`${startDateStr}T00:00:00`) : null;
  const end = endDateStr ? new Date(`${endDateStr}T23:59:59.999`) : null;

  if (start && date < start) return false;
  if (end && date > end) return false;

  return true;
}

/**
 * Clamp and format a duration expressed in minutes into a human readable "XhYY" string.
 *
 * @param minutes - Duration in minutes.
 * @returns Formatted duration string (e.g. "2h05").
 */
export function formatHoursMinutes(minutes: number): string {
    const safe = Math.max(0, minutes);
    const h = Math.floor(safe / 60);
    const m = safe % 60;
    return `${h}h${m.toString().padStart(2, "0")}`;
}

type DayKey = string; // "YYYY-MM-DD"

export function toDayKey(d: Date): DayKey {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export function parseDayKey(day: string): Date {
    // day is YYYY-MM-DD
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d);
}

export function daysBetween(a: Date, b: Date) {
    const ms = 24 * 60 * 60 * 1000;
    const da = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const db = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return Math.round((db - da) / ms);
}

export function computeStreak(dayKeys: DayKey[]): { current: number; best: number } {
    if (dayKeys.length === 0) return { current: 0, best: 0 };

    const uniq = Array.from(new Set(dayKeys)).sort(); // ascending
    const dates = uniq.map(parseDayKey);

    let best = 1;
    let run = 1;

    for (let i = 1; i < dates.length; i++) {
        const delta = daysBetween(dates[i - 1], dates[i]);
        if (delta === 1) run += 1;
        else run = 1;
        best = Math.max(best, run);
    }

    // current streak = run ending on most recent day (relative to "today" or last logged day)
    const last = dates[dates.length - 1];
    const today = new Date();
    const deltaToToday = daysBetween(last, new Date(today.getFullYear(), today.getMonth(), today.getDate()));

    // if last log is today => streak is last run
    // if last log is yesterday => streak continues
    // else current = 0 or 1? UX-wise usually 0
    let current = run;
    if (deltaToToday > 1) current = 0;

    return { current, best };
}

export function clampRange<T>(arr: T[], max: number) {
    if (arr.length <= max) return arr;
    return arr.slice(arr.length - max);
}

export function simpleMovingAverage(values: number[], windowSize: number) {
    if (windowSize <= 1) return values;
    const out: number[] = [];
    for (let i = 0; i < values.length; i++) {
        const from = Math.max(0, i - windowSize + 1);
        const chunk = values.slice(from, i + 1);
        out.push(chunk.reduce((s, v) => s + v, 0) / chunk.length);
    }
    return out;
}

export function pctDelta(current: number, previous: number) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 100);
}

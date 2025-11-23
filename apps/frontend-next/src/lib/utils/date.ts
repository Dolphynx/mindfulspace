export function dateInputToNoonIso(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date();
    date.setFullYear(y);
    date.setMonth(m - 1);
    date.setDate(d);
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
}

export function formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString();
}
export type MoodValue = 1 | 2 | 3 | 4 | 5;

export type MoodOption = {
    value: MoodValue;      // clé stable (persistée en DB)
    emoji: string;         // rendu
    label: string;         // i18n-friendly
};

export const MOOD_OPTIONS: MoodOption[] = [
    { value: 1, emoji: "🥲", label: "Difficile" },
    { value: 2, emoji: "🙁", label: "Pas top" },
    { value: 3, emoji: "😐", label: "Correct" },
    { value: 4, emoji: "🙂", label: "Bien" },
    { value: 5, emoji: "😊", label: "Excellent" },
];

// Helpers utiles partout
export const moodToPercent = (v: MoodValue) => v * 20;         // 1..5 -> 20..100
export const getMood = (v: number) =>
    MOOD_OPTIONS.find(o => o.value === v as MoodValue) ?? MOOD_OPTIONS[2];

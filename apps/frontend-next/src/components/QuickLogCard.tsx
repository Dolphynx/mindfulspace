'use client';

import { useState, useEffect, useRef } from 'react';
import MoodPicker from '@/components/MoodPicker';
import { MOOD_OPTIONS, MoodOption, MoodValue } from '@/lib';

type SessionType = {
    id: string;
    name: string;
    units: { sessionUnit: { value: string } }[];
};

// Helpers pour gérer les dates
// ⚠️ On met volontairement l'heure à 12:00 pour éviter le décalage UTC (-1 jour)
function startOfToday(): Date {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
}

function startOfYesterday(): Date {
    const d = startOfToday();
    d.setDate(d.getDate() - 1);
    return d;
}

// Format YYYY-MM-DD pour <input type="date">
function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format d'affichage "18/11/2025"
function formatDateForDisplay(date: Date): string {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export default function QuickLogCard() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

    const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
    const [selectedType, setSelectedType] = useState<SessionType | null>(null);

    // choix affiché (today / yesterday / custom)
    const [dateChoice, setDateChoice] = useState<'today' | 'yesterday' | 'custom'>('today');
    // vraie date utilisée pour l'encodage (toujours à 12:00)
    const [date, setDate] = useState<Date>(startOfToday());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const dateInputRef = useRef<HTMLInputElement | null>(null);

    const [value, setValue] = useState(8);

    // mood + quality envoyée à l'API
    const [mood, setMood] = useState<MoodValue | null>(null);
    const [quality, setQuality] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // ouverture automatique du picker natif quand on affiche l'input
    useEffect(() => {
        if (showDatePicker && dateInputRef.current) {
            const input = dateInputRef.current as HTMLInputElement & {
                showPicker?: () => void;
            };

            input.focus();

            if (typeof input.showPicker === 'function') {
                input.showPicker();
            }
        }
    }, [showDatePicker]);

    useEffect(() => {
        async function fetchTypes() {
            try {
                const res = await fetch(`${baseUrl}/sessions/types`);
                if (!res.ok) throw new Error('Failed to fetch session types');
                const data: SessionType[] = await res.json();
                setSessionTypes(data);
                setSelectedType(data[0]);
            } catch (e) {
                console.error(e);
            }
        }
        fetchTypes();
    }, [baseUrl]);

    async function handleSubmit() {
        if (!selectedType) return;

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${baseUrl}/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    value,
                    quality,
                    // date à 12:00 locale → évite le -1 jour en UTC
                    dateSession: date.toISOString(),
                    sessionTypeId: selectedType.id,
                    expectedUnit: selectedType.units?.[0]?.sessionUnit.value,
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setMessage('✅ Logged successfully!');
            window.location.reload();
        } catch (e) {
            console.error(e);
            setMessage('❌ Error logging session');
        } finally {
            setLoading(false);
        }
    }

    function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.value) return;
        const [year, month, day] = e.target.value.split('-').map(Number);

        // ⚠️ On crée la date avec l'heure à 12:00 pour éviter le décalage en UTC
        const newDate = new Date(year, month - 1, day, 12, 0, 0, 0);
        setDate(newDate);
        setDateChoice('custom');
        setShowDatePicker(false);
    }

    // Quand l'utilisateur choisit une humeur dans MoodPicker :
    function handleMoodChange(v: MoodValue, _opt: MoodOption) {
        setMood(v);
        const index = MOOD_OPTIONS.findIndex((o) => o.value === v);
        setQuality(index >= 0 ? index + 1 : null); // quality = 1..5
    }

    return (
        <section className="bg-white border border-brandBorder rounded-xl shadow-sm flex flex-col p-5 max-w-md w-full">
            <header className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Quick Log</h2>
                <p className="text-gray-600 text-sm">Record your daily wellness metrics</p>
            </header>

            {/* Date actuellement sélectionnée */}
            <p className="text-xs text-gray-500 mb-1">
                Logging for{' '}
                <span className="font-medium text-gray-700">
                    {formatDateForDisplay(date)}
                </span>
                {dateChoice === 'today'
                    ? ' (today)'
                    : dateChoice === 'yesterday'
                        ? ' (yesterday)'
                        : ''}
            </p>

            {/* Sélecteur de date */}
            <div className="flex items-center gap-2 mb-4">
                {(['yesterday', 'today'] as const).map((choice) => (
                    <button
                        key={choice}
                        onClick={() => {
                            setDateChoice(choice);
                            setShowDatePicker(false);
                            setDate(choice === 'today' ? startOfToday() : startOfYesterday());
                        }}
                        className={`flex-1 py-2 rounded-md border ${
                            dateChoice === choice
                                ? 'bg-brandGreen text-white border-brandGreen'
                                : 'bg-white text-gray-700 border-gray-300'
                        }`}
                    >
                        {choice === 'today' ? 'Today' : 'Yesterday'}
                    </button>
                ))}

                {/* Bouton calendrier pour date personnalisée */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowDatePicker((prev) => !prev)}
                        className={`px-3 py-2 rounded-md border flex items-center justify-center ${
                            dateChoice === 'custom'
                                ? 'bg-brandGreen text-white border-brandGreen'
                                : 'bg-white text-gray-700 border-gray-300'
                        }`}
                        aria-label="Choose another date"
                        title="Choose another date"
                    >
                        <span className="text-lg">📅</span>
                    </button>

                    {showDatePicker && (
                        <input
                            ref={dateInputRef}
                            type="date"
                            value={formatDateForInput(date)}
                            onChange={handleDateChange}
                            className="absolute z-10 top-full right-0 mt-2 rounded-md border border-gray-300 bg-white p-2 text-sm shadow-lg"
                        />
                    )}
                </div>
            </div>

            {/* Tabs types de session */}
            <div className="flex justify-between mb-6">
                {sessionTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedType(type)}
                        className={`flex-1 py-2 rounded-md capitalize ${
                            selectedType?.id === type.id
                                ? 'bg-brandGreen text-white font-medium'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {type.name}
                    </button>
                ))}
            </div>

            {/* Slider valeur */}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">
                    {selectedType
                        ? `${selectedType.name} (${selectedType.units?.[0]?.sessionUnit.value}) : ${value}`
                        : `Value: ${value}`}
                </label>
                <input
                    type="range"
                    min={selectedType?.name === 'Sleep' ? 0 : 0}
                    max={selectedType?.name === 'Sleep' ? 12 : 120}
                    step={selectedType?.name === 'Sleep' ? 1 : 5}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full accent-brandGreen"
                />
            </div>

            {/* Mood / Qualité via MoodPicker */}
            <div className="mb-4 text-center">
                <span className="block text-gray-700 text-sm mb-2">Quality</span>
                <MoodPicker
                    value={mood}
                    onChangeAction={handleMoodChange}
                    size="sm"
                    variant="row"
                    tone="minimal"
                    className="justify-center"
                />
            </div>

            {/* Bouton submit */}
            <button
                onClick={handleSubmit}
                disabled={loading || !selectedType}
                className="w-full py-3 rounded-md bg-brandGreen text-white font-medium hover:bg-brandGreen/90 disabled:opacity-60"
            >
                {loading ? 'Saving...' : `Log ${selectedType?.name ?? ''}`}
            </button>

            {message && (
                <p
                    className={`mt-3 text-center text-sm ${
                        message.startsWith('✅') ? 'text-green-600' : 'text-red-500'
                    }`}
                >
                    {message}
                </p>
            )}
        </section>
    );
}

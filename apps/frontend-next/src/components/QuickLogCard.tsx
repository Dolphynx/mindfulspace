'use client';

import { useState, useEffect } from 'react';

type SessionType = {
    id: string;
    name: string;
    sessionUnit: { value: string };
};

export default function QuickLogCard() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
    const [selectedType, setSelectedType] = useState<SessionType | null>(null);
    const [date, setDate] = useState<'today' | 'yesterday'>('today');
    const [value, setValue] = useState(8);
    const [quality, setQuality] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // 🧠 Fetch session types once on mount
    useEffect(() => {
        async function fetchTypes() {
            try {
                const res = await fetch(`${baseUrl}/sessions/types`);
                if (!res.ok) throw new Error('Failed to fetch session types');
                const data = await res.json();
                setSessionTypes(data);
                setSelectedType(data[0]); // select the first one by default
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
                    dateSession:
                        date === 'today'
                            ? new Date().toISOString()
                            : new Date(Date.now() - 86400000).toISOString(),
                    sessionTypeId: selectedType.id,
                    expectedUnit: selectedType.sessionUnit.value,
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setMessage('✅ Logged successfully!');
        } catch (e) {
            console.error(e);
            setMessage('❌ Error logging session');
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="bg-white border border-brandBorder rounded-xl shadow-sm flex flex-col p-5 max-w-md w-full">
            <header className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Quick Log</h2>
                <p className="text-gray-600 text-sm">Record your daily wellness metrics</p>
            </header>

            {/* Date Selector */}
            <div className="flex gap-2 mb-4">
                {(['yesterday', 'today'] as const).map((d) => (
                    <button
                        key={d}
                        onClick={() => setDate(d)}
                        className={`flex-1 py-2 rounded-md border ${
                            date === d
                                ? 'bg-brandGreen text-white border-brandGreen'
                                : 'bg-white text-gray-700 border-gray-300'
                        }`}
                    >
                        {d === 'today' ? 'Today' : 'Yesterday'}
                    </button>
                ))}
            </div>

            {/* Tabs from DB */}
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

            {/* Value Slider */}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">
                    {selectedType
                        ? `${selectedType.name} (${selectedType.sessionUnit.value}) : ${value}`
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

            {/* Quality */}
            <div className="mb-4 text-center">
                <span className="block text-gray-700 text-sm mb-2">Quality</span>
                <div className="flex justify-center gap-4 text-3xl">
                    {[1, 2, 3].map((q) => (
                        <button
                            key={q}
                            onClick={() => setQuality(q)}
                            className={`transition-transform ${
                                quality === q ? 'scale-110' : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                            {q === 1 ? '😴' : q === 2 ? '😊' : '🤩'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit */}
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

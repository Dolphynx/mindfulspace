'use client';

import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    DotProps,
} from 'recharts';

type SessionPoint = {
    day: string;
    value: number;
};

type SessionChartCardProps = {
    type: 'sleep' | 'meditation' | 'exercise';
    unit?: string;
};

type SessionType = {
    id: string;
    name: string;
    units: { sessionUnit: { value: string } }[];
};

function CustomDot(props: DotProps) {
    const { cx, cy } = props;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;
    return <circle cx={cx} cy={cy} r={6} fill="#4da884" stroke="#4da884" strokeWidth={2} />;
}

function CustomActiveDot(props: { cx?: number; cy?: number }) {
    const { cx, cy } = props;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;
    return <circle cx={cx} cy={cy} r={7} fill="#4da884" stroke="#ffffff" strokeWidth={2} />;
}

export default function SessionChartCard({ type }: SessionChartCardProps) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const [data, setData] = useState<SessionPoint[]>([]);
    const [loading, setLoading] = useState(true);

    const [sessionUnit, setSessionUnit] = useState<string>(''); // ✅ ADDED

    // Fetch data AND first unit
    useEffect(() => {
        async function fetchAll() {
            try {
                // 1️⃣ Fetch all session types to extract the correct unit
                const typesRes = await fetch(`${baseUrl}/sessions/types`);
                const allTypes: SessionType[] = await typesRes.json();

                const found = allTypes.find(
                    (t) => t.name.toLowerCase() === type.toLowerCase()
                );

                if (found) {
                    setSessionUnit(found.units?.[0]?.sessionUnit.value ?? ''); // ✅ USE FIRST UNIT
                }

                // 2️⃣ Fetch session values
                const res = await fetch(`${baseUrl}/sessions/${type}/last7days`);
                if (!res.ok) throw new Error('Failed to fetch data');

                const result = await res.json();

                const transformed: SessionPoint[] = result.map(
                    (d: { date: string; value: number }) => ({
                        day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
                        value: d.value,
                    })
                );

                setData(transformed);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        fetchAll();
    }, [baseUrl, type]);

    const title = type.charAt(0).toUpperCase() + type.slice(1) + ' Tracking';

    if (loading) {
        return (
            <section className="bg-white border border-[#d9eadf] rounded-xl shadow-sm flex flex-col p-5 text-center">
                <p className="text-gray-600">Loading {title}...</p>
            </section>
        );
    }

    return (
        <section className="bg-white border border-[#d9eadf] rounded-xl shadow-sm flex flex-col">
            <header className="p-5 border-b border-[#d9eadf]">
                <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
                <p className="text-gray-600">Your {type} pattern this week</p>
            </header>

            <div className="p-5 w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d9eadf" vertical={false} />
                        <XAxis dataKey="day" stroke="#4b5563" />
                        <YAxis stroke="#4b5563" />
                        <Tooltip
                            formatter={(value) => [`${value} ${sessionUnit}`, title]} // ✅ UPDATED
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#4da884"
                            strokeWidth={3}
                            dot={<CustomDot />}
                            activeDot={<CustomActiveDot />}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}

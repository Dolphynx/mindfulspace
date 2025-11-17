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

type ActiveDotPropsLike = {
    cx?: number;
    cy?: number;
};

type SessionChartCardProps = {
    type: 'sleep' | 'meditation' | 'exercise';
    unit?: string; // e.g. "Hours" or "Minutes"
};

function CustomDot(props: DotProps) {
    const { cx, cy } = props;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;
    return <circle cx={cx} cy={cy} r={6} fill="#4da884" stroke="#4da884" strokeWidth={2} />;
}

function CustomActiveDot(props: ActiveDotPropsLike) {
    const { cx, cy } = props;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;
    return <circle cx={cx} cy={cy} r={7} fill="#4da884" stroke="#ffffff" strokeWidth={2} />;
}

export default function SessionChartCard({ type, unit = 'Minutes' }: SessionChartCardProps) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const [data, setData] = useState<SessionPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`${baseUrl}/sessions/${type}/last7days`);
                if (!res.ok) throw new Error('Failed to fetch data');
                const result = await res.json();

                const transformed: SessionPoint[] = result.map((d: { date: string; value: number }) => {
                    const day = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });
                    return { day, value: d.value };
                });

                setData(transformed);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [baseUrl, type]);

    const title = String(type).charAt(0).toUpperCase() + String(type).slice(1) + " Tracking";

    const displayedRange =
        data.length > 0 ? `${data[0].day} → ${data[data.length - 1].day}` : '';

    if (loading) {
        return (
            <section className="bg-white border border-[#d9eadf] rounded-xl shadow-sm flex flex-col p-5 text-center">
                <p className="text-gray-600">Loading {title}...</p>
            </section>
        );
    }

    return (
        <section className="bg-white border border-[#d9eadf] rounded-xl shadow-sm flex flex-col">
            <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-5 border-b border-[#d9eadf]">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                        {title}
                    </h2>
                    <p className="text-gray-600 text-lg">Your {type} pattern this week</p>
                </div>
            </header>

            <div className="p-5 w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d9eadf" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="#4b5563"
                            tick={{ fontSize: 16, fill: '#4b5563' }}
                            tickLine={false}
                            axisLine={{ stroke: '#4b5563' }}
                        />
                        <YAxis
                            stroke="#4b5563"
                            tick={{ fontSize: 16, fill: '#4b5563' }}
                            tickLine={false}
                            axisLine={{ stroke: '#4b5563' }}
                        />
                        <Tooltip
                            cursor={{
                                stroke: '#94c5a9',
                                strokeWidth: 1,
                                strokeDasharray: '4 2',
                            }}
                            contentStyle={{
                                borderRadius: '0.5rem',
                                borderColor: '#d9eadf',
                                boxShadow: '0 8px 24px -8px rgba(0,0,0,0.08)',
                                fontSize: '0.875rem',
                            }}
                            labelStyle={{
                                fontWeight: 600,
                                color: '#1f2937',
                                marginBottom: '0.25rem',
                            }}
                            formatter={(value) => [`${value} ${unit}`, title]}
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

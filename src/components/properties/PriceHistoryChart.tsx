'use client';
import type { PriceHistoryEntry } from '@/lib/types';
import { format } from 'date-fns';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface PriceHistoryChartProps {
    data: PriceHistoryEntry[];
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
    const chartData = data.map(entry => ({
        ...entry,
        date: new Date(entry.date),
    }));

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${Math.round(value / 1000)}k`;
        return `$${value}`;
    };

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(date, 'MMM yyyy')}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                    />
                    <YAxis
                        tickFormatter={(price) => formatCurrency(price)}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={['dataMin - 100000', 'dataMax + 100000']}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                        }}
                        labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                        formatter={(value: number) => [formatCurrency(value), 'Price']}
                    />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ChartDataPoint {
  date: string;
  wpm: number;
  accuracy: number;
}

interface StatsChartProps {
  data: ChartDataPoint[];
}

export function StatsChart({ data }: StatsChartProps) {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM dd');
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip 
            labelFormatter={formatDate}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="wpm" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="WPM"
          />
          <Line 
            type="monotone" 
            dataKey="accuracy" 
            stroke="hsl(var(--accent))" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Accuracy %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
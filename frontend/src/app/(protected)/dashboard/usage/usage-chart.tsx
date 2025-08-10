'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts';

const allData = [
  { date: '2025-01-01', minutes: 85, vm: 12 },
  { date: '2025-01-15', minutes: 92, vm: 15 },
  { date: '2025-02-01', minutes: 78, vm: 8 },
  { date: '2025-02-15', minutes: 105, vm: 18 },
  { date: '2025-03-01', minutes: 88, vm: 14 },
  { date: '2025-03-15', minutes: 95, vm: 16 },
  { date: '2025-04-01', minutes: 100, vm: 24 },
  { date: '2025-04-15', minutes: 112, vm: 28 },
  { date: '2025-05-01', minutes: 95, vm: 18 },
  { date: '2025-05-15', minutes: 108, vm: 22 },
  { date: '2025-06-01', minutes: 120, vm: 30 },
  { date: '2025-06-15', minutes: 115, vm: 26 },
];

const metrics = [
  { key: 'minutes', label: 'Minutes Talked', color: 'var(--chart-1)' },
  { key: 'vm', label: 'Voice Messages', color: 'var(--chart-2)' },
] as const;

export function UsageChart() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 5, 30),
  });

  const label = useMemo(() => {
    if (!range?.from) return 'Pick a date range';
    const from = format(range.from, 'LLL dd, yyyy');
    const to = range.to ? ` - ${format(range.to, 'LLL dd, yyyy')}` : '';
    return from + to;
  }, [range]);

  const filteredData = useMemo(() => {
    if (!range?.from) return allData;
    return allData.filter((item) => {
      const itemDate = new Date(item.date);
      const fromDate = range.from!;
      const toDate = range.to || range.from!;
      return itemDate >= fromDate && itemDate <= toDate;
    });
  }, [range]);

  const formattedData = useMemo(() => {
    return filteredData.map((item) => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd'),
    }));
  }, [filteredData]);

  return (
    <Card className="relative opacity-60">
      <CardHeader className="flex justify-between">
        <CardTitle className="flex items-center gap-2">
          Analytics
          <span className="text-secondary-foreground rounded px-2 py-1 text-xs">Soon</span>
        </CardTitle>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled>
              {label}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              defaultMonth={range?.from}
              selected={range}
              onSelect={setRange}
            />
          </PopoverContent>
        </Popover>
      </CardHeader>

      <CardContent>
        {formattedData.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">No data available yet.</p>
            </div>
          </div>
        ) : (
          <div className="h-[350px] w-full">
            <ChartContainer
              className="h-full w-full"
              config={metrics.reduce(
                (acc, m) => ({
                  ...acc,
                  [m.key]: { label: m.label, color: m.color },
                }),
                {} as Record<string, { label: string; color: string }>,
              )}
            >
              <LineChart
                data={formattedData}
                width={800}
                height={350}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="var(--muted-foreground)"
                  strokeOpacity={0.1}
                />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent active={active} payload={payload} hideLabel />
                  )}
                />
                <ChartLegend content={({ payload }) => <ChartLegendContent payload={payload} />} />

                {metrics.map(({ key, label, color }) => (
                  <Line
                    key={key}
                    dataKey={key}
                    name={label}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

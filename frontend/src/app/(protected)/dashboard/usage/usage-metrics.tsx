'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface UsageMetricProps {
  metricType: string;
  description: string;
  currentValue: number;
  previousValue: number | null;
  maxLimit: number;
}

function UsageMetricCard({
  currentValue,
  previousValue,
  metricType,
  description,
  maxLimit,
}: UsageMetricProps) {
  const trendDirection = previousValue ? (currentValue > previousValue ? 'up' : 'down') : null;
  const percentageChange = previousValue
    ? (((currentValue - previousValue) / previousValue) * 100).toFixed(1)
    : null;
  const usagePercentage = Math.min((currentValue / maxLimit) * 100, 100);

  return (
    <Card className="relative opacity-60">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {currentValue} {metricType}
          <span className="text-secondary-foreground rounded px-2 py-1 text-xs">Soon</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          {trendDirection &&
            (trendDirection === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ))}
          {percentageChange && (
            <span
              className={`text-xs ${trendDirection === 'up' ? 'text-green-500' : 'text-red-500'}`}
            >
              {percentageChange}% from last month
            </span>
          )}
        </div>
        <div className="space-y-2">
          <div className="text-muted-foreground flex justify-between text-xs">
            <span>0</span>
            <span>
              {maxLimit} {metricType}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function UsageMetrics() {
  const usageMetrics = [
    {
      metricType: 'Minutes',
      description: 'Talked this month',
      currentValue: 100,
      previousValue: 90,
      maxLimit: 120,
    },
    {
      metricType: 'Voice Messages',
      description: 'Sent this month',
      currentValue: 24,
      previousValue: 20,
      maxLimit: 100,
    },
    {
      metricType: 'GB',
      description: 'Of your allocated used',
      currentValue: 4.3,
      previousValue: 3.8,
      maxLimit: 10,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {usageMetrics.map((metric) => (
        <UsageMetricCard key={metric.metricType} {...metric} />
      ))}
    </div>
  );
}

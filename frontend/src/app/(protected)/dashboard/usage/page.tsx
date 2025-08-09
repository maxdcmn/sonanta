import { UsageMetrics } from '@/app/(protected)/dashboard/usage/usage-metrics';
import { UsageChart } from '@/app/(protected)/dashboard/usage/usage-chart';

export default function UsagePage() {
  return (
    <div className="space-y-4">
      <h3 className="pl-6 text-lg font-semibold">Usage</h3>
      <div className="space-y-6">
        <UsageMetrics />
        <UsageChart />
      </div>
    </div>
  );
}

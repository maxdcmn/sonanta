import { SubscriptionForm } from '@/app/(protected)/dashboard/billing/subscription-form';
import { PaymentForm } from '@/app/(protected)/dashboard/billing/payment-form';
import { BillingHistory } from '@/app/(protected)/dashboard/billing/billing-history';

export default function BillingPage() {
  return (
    <div className="space-y-4">
      <h3 className="pl-6 text-lg font-semibold">Billing & Invoices</h3>
      <div className="grid gap-6">
        <SubscriptionForm />
        <PaymentForm />
        <BillingHistory />
      </div>
    </div>
  );
}

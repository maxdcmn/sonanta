'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '$0',
    description: 'Limited context window and calls.',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$29/mo',
    description: 'Context window up to 16k tokens and unlimited calls.',
  },
];

export function SubscriptionForm() {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Select the plan that best fits your needs.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                selectedPlan === plan.id ? 'bg-primary/10' : 'bg-primary/3 hover:bg-primary/5'
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {plan.price} {plan.name}
                  </CardTitle>
                  <div className="flex h-6 w-20 items-center justify-end">
                    {selectedPlan === plan.id && (
                      <Badge variant="secondary" className="bg-foreground/10 text-foreground">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

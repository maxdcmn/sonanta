'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Please enter a valid card number'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  cvv: z.string().min(3, 'Please enter a valid CVV'),
  cardholderName: z.string().min(1, 'Cardholder name is required'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export function PaymentForm() {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    },
  });

  function onSubmit(values: PaymentFormData) {
    console.log(values);
  }

  return (
    <Card className="relative opacity-60">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Payment Method
          <span className="text-secondary-foreground rounded px-2 py-1 text-xs">Soon</span>
        </CardTitle>
        <CardDescription>Add a new payment method to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input className="bg-background" placeholder="" {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input className="bg-background" placeholder="" {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input className="bg-background" placeholder="" {...field} disabled />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input className="bg-background" placeholder="" {...field} disabled />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled>
              Add Payment Method
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

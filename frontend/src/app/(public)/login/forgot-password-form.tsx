'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email'),
});
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
  onBack,
  className,
  ...props
}: { onBack?: () => void } & React.ComponentProps<'div'>) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const supabase = createClient();
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ForgotPasswordValues) {
    setEmail(values.email);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message || 'Error sending reset email.');
    } else {
      setSent(true);
    }
  }

  return (
    <div className={cn('flex flex-col gap-6 pb-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <h1 className="text-center font-mono text-2xl">Forgot Password</h1>
          {sent ? (
            <>
              <p className="text-center text-sm">We&apos;ve sent a reset link to {email}</p>
              <Button type="button" className="w-full" onClick={onBack}>
                Back to Login
              </Button>
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@sonanta.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  Send Reset Link
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}

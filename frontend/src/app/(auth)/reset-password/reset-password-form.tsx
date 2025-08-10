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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({
  token,
  className,
  ...props
}: { token: string } & React.ComponentProps<'div'>) {
  const [success, setSuccess] = useState(false);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const supabase = createClient();
  const isSubmitting = form.formState.isSubmitting;

  if (!token) {
    return (
      <div className={cn('flex items-center justify-center pb-20', className)} {...props}>
        <p>Invalid or missing token.</p>
      </div>
    );
  }

  async function onSubmit(values: ResetPasswordValues) {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      toast.error(error.message || 'Failed to reset password.');
    } else {
      setSuccess(true);
      toast.success('Password reset successfully.');
      await supabase.auth.signOut();
    }
  }

  return (
    <div className={cn('flex flex-col gap-6 pb-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <h1 className="text-center font-mono text-2xl">Reset Password</h1>
          {success ? (
            <>
              <div className="text-center text-sm">Password changed.</div>
              <Button asChild className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Reset Password
              </Button>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}

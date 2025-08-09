'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressDots } from '@/components/ui/progress-dots';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const stepSchemas = [
  z.object({
    email: z.email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    terms: z.boolean().refine((val) => val, { message: 'You must agree to the terms' }),
  }),
  z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(10, 'Phone number is required'),
  }),
  z.object({
    otp: z.string().length(6, 'Please enter the 6-digit code'),
  }),
] as const;

export type FormData = {
  email: string;
  password: string;
  terms: boolean;
  firstName: string;
  lastName: string;
  phone: string;
};

type CurrentSchemaType = z.infer<(typeof stepSchemas)[number]>;

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const [formData, setFormData] = useState<Partial<FormData>>({
    email: '',
    password: '',
    terms: false,
    firstName: '',
    lastName: '',
    phone: '',
  });

  const cooldownStartedRef = useRef(false);

  function handleResendCooldown() {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendCooldown(60);
    timerRef.current = window.setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;
  }

  const StepForm = () => {
    const form = useForm<CurrentSchemaType>({
      resolver: zodResolver(stepSchemas[currentStep]),
      defaultValues: formData,
      mode: 'onTouched',
      shouldUnregister: false,
    });

    useEffect(() => {
      form.reset(formData as CurrentSchemaType);
    }, [formData, currentStep, form]);

    function handleBack() {
      const currentValues = form.getValues();
      setFormData((prev) => ({ ...prev, ...currentValues }));
      setCurrentStep((s) => Math.max(0, s - 1));
    }

    async function onSubmit(data: CurrentSchemaType) {
      const updated = { ...formData, ...data };

      if (currentStep === 0) {
        setFormData(updated);
        setCurrentStep(1);
        return;
      }

      if (currentStep === 1) {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.signUp({
            email: updated.email!,
            password: updated.password!,
            options: {
              data: {
                first_name: updated.firstName,
                last_name: updated.lastName,
                phone: updated.phone,
              },
              emailRedirectTo: `${location.origin}/auth/callback`,
            },
          });

          if (error) {
            toast.error(error.message || 'Signup failed');
            return;
          }

          setFormData(updated);
          if (!cooldownStartedRef.current) {
            cooldownStartedRef.current = true;
            handleResendCooldown();
          }
          setCurrentStep(2);
        } catch {
          toast.error('Something went wrong');
        }
        return;
      }
    }

    async function resendVerification() {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: formData.email!,
        });
        if (error) {
          toast.error(error.message || 'Could not resend email');
          return;
        }
        toast.success('Verification email sent');
        handleResendCooldown();
      } catch {
        toast.error('Something went wrong');
      }
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {currentStep === 0 && (
            <>
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@sonanta.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="terms"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">
                      I agree to the
                      <Link
                        href="/terms"
                        className="text-blue-500 underline-offset-4 hover:underline"
                      >
                        {' '}
                        terms and conditions
                      </Link>
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Continue
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-background text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" type="button" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  GitHub
                </Button>
                <Button variant="outline" type="button" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Google
                </Button>
              </div>
              <div className="text-muted-foreground text-center text-xs">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-500 underline-offset-4 hover:underline">
                  Log in
                </Link>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div className="flex gap-2">
                <FormField
                  name="firstName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="lastName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Create Account
                </Button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <p className="text-center text-sm">
                We&apos;ve sent a confirmation email to {formData.email}
              </p>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" asChild>
                  <Link href="/">Home</Link>
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={resendVerification}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Mail'}
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    );
  };

  return (
    <div className={cn('grid min-h-[600px] grid-rows-[1fr_auto] gap-6 pt-3', className)} {...props}>
      <div className="flex flex-col justify-center gap-6">
        <h1 className="text-center font-mono text-2xl">
          {currentStep === 0 && 'Create an account'}
          {currentStep === 1 && 'Personal information'}
          {currentStep === 2 && 'Almost there...'}
        </h1>
        <StepForm />
      </div>
      <div className="flex justify-center">
        <ProgressDots currentStep={currentStep + 1} totalSteps={3} />
      </div>
    </div>
  );
}

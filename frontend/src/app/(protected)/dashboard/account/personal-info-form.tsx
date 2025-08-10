'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/lib/auth-provider';

const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Please enter a valid email'),
  newPassword: z
    .string()
    .default('')
    .refine((v) => v.length === 0 || v.length >= 8, {
      message: 'New password must be at least 8 characters',
    }),
});

export function PersonalInfoForm() {
  const [isEditing, setIsEditing] = useState(false);
  const { userInfo } = useAuth();

  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: userInfo?.firstName || '',
      lastName: userInfo?.lastName || '',
      email: userInfo?.email || '',
      newPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof personalInfoSchema>) {
    const supabase = createClient();
    const updates: { email?: string; password?: string; data?: Record<string, unknown> } = {};

    let hasEmailChange = false;
    let hasOtherChanges = false;

    if (values.email !== userInfo?.email) {
      updates.email = values.email;
      hasEmailChange = true;
    }

    if (values.newPassword && values.newPassword.length >= 8) {
      updates.password = values.newPassword;
      hasOtherChanges = true;
    }

    if (values.firstName !== userInfo?.firstName || values.lastName !== userInfo?.lastName) {
      updates.data = { firstName: values.firstName, lastName: values.lastName };
      hasOtherChanges = true;
    }

    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      toast.error('Update failed', { description: error.message });
      return;
    }

    if (hasEmailChange) {
      toast.success('Mail change requires authentication with the old mail');
    } else if (hasOtherChanges) {
      toast.success('Account updated');
    }

    setIsEditing(false);
    form.setValue('newPassword', '');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          disabled={!isEditing}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-start">
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Details
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Confirm</Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

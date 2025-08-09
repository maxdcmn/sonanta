'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: true,
    securityEmails: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>Choose which types of emails you want to receive.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="">Account Activity</Label>
          </div>
          <Switch
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({ ...prev, emailNotifications: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="">Marketing Emails</Label>
          </div>
          <Switch
            checked={preferences.marketingEmails}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({ ...prev, marketingEmails: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="">Security Alerts</Label>
          </div>
          <Switch
            checked={preferences.securityEmails}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({ ...prev, securityEmails: checked }))
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

import { PersonalInfoForm } from '@/app/(protected)/dashboard/account/personal-info-form';
import { NotificationSettings } from '@/app/(protected)/dashboard/account/notification-settings';

export default function AccountPage() {
  return (
    <div className="space-y-4">
      <h3 className="pl-6 text-lg font-semibold">Account</h3>
      <div className="grid gap-6">
        <PersonalInfoForm />
        <NotificationSettings />
      </div>
    </div>
  );
}

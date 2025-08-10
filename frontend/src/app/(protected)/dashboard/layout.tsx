'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-provider';
import { UserIcon, ChartBarIcon, CreditCardIcon } from 'lucide-react';

const navigationItems = [
  {
    icon: <UserIcon className="h-4 w-4" />,
    id: 'account',
    label: 'Account',
    href: '/dashboard/account',
  },
  {
    icon: <ChartBarIcon className="h-4 w-4" />,
    id: 'usage',
    label: 'Usage',
    href: '/dashboard/usage',
  },
  {
    icon: <CreditCardIcon className="h-4 w-4" />,
    id: 'billing',
    label: 'Billing & Invoices',
    href: '/dashboard/billing',
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userInfo } = useAuth();

  const displayName =
    userInfo && userInfo.firstName && userInfo.lastName
      ? `${userInfo.firstName} ${userInfo.lastName}`
      : userInfo?.email || '';

  return (
    <div className="mx-auto max-w-6xl px-10 pt-40 pb-20">
      <div className="lg:hidden">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm font-medium">{displayName}</div>
          <div className="text-muted-foreground text-sm">{userInfo?.email}</div>
        </div>
        <nav className="mb-8">
          <Tabs value={pathname} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {navigationItems.map((item) => (
                <TabsTrigger key={item.id} value={item.href} asChild className="font-normal">
                  <Link href={item.href}>{item.label}</Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </nav>
        <div className="space-y-6">{children}</div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-12">
        <div className="col-span-1">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm font-medium">{displayName}</div>
            <div className="text-muted-foreground text-sm">{userInfo?.email}</div>
          </div>
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  pathname === item.href
                    ? 'bg-secondary text-secondary-foreground'
                    : 'hover:bg-muted',
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="col-span-3">
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

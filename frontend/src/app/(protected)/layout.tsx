import { ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';
import { SignOut } from '@/components/layout/signout';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <SignOut />
      </div>
      {children}
    </div>
  );
}

import { ReactNode } from 'react';
import { Header } from '@/components/layout/header';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}

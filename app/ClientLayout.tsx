'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/Header'), { ssr: false });

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
    </>
  );
}
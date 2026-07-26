import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/admin/auth';
import { ToastProvider } from '@/components/admin/Toast';

export const metadata: Metadata = {
  title: 'Panel administrativo',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}

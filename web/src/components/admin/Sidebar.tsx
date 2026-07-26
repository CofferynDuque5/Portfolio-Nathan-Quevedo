'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Image as ImageIcon, Inbox, LogOut, ExternalLink } from 'lucide-react';
import { RESOURCES, RESOURCE_GROUPS } from '@/lib/admin/resources';
import { Icon } from '@/lib/icon';
import { useAuth } from '@/lib/admin/auth';
import { cn } from '@/lib/utils';

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const link = (href: string, label: string, icon: React.ReactNode) => (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
        isActive(href)
          ? 'bg-brand-600 text-white shadow-glow'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
      )}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-white/10">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white">N</span>
        <span className="font-bold">Panel Admin</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {link('/admin', 'Dashboard', <LayoutDashboard size={18} />)}
        {link('/admin/media', 'Multimedia', <ImageIcon size={18} />)}
        {link('/admin/messages', 'Mensajes', <Inbox size={18} />)}

        {RESOURCE_GROUPS.map((group) => {
          const items = Object.values(RESOURCES).filter((r) => r.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="pt-4">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{group}</p>
              {items.map((r) => link(`/admin/${r.key}`, r.label, <Icon name={r.icon} size={18} />))}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
        >
          <ExternalLink size={18} /> Ver sitio
        </Link>
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {user?.name?.charAt(0) ?? 'A'}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.name}</div>
            <div className="truncate text-xs text-slate-500">{user?.role}</div>
          </div>
          <button onClick={logout} title="Cerrar sesión" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

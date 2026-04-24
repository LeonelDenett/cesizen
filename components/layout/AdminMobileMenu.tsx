'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/users', label: 'Utilisateurs', icon: 'group', exact: false },
  { href: '/admin/info-pages', label: 'Articles', icon: 'article', exact: false },
  { href: '/admin/respiration', label: 'Respiration', icon: 'self_improvement', exact: false },
];

interface AdminMobileMenuProps {
  userName: string;
  userEmail: string;
}

export default function AdminMobileMenu({ userName, userEmail }: AdminMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  async function handleSignOut() {
    setOpen(false);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  }

  return (
    <div className="lg:hidden">
      {/* Burger button */}
      <button type="button" onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-green-300 hover:bg-green-800 transition-colors"
        aria-label="Ouvrir le menu">
        <span className="material-symbols-rounded text-2xl">menu</span>
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-green-900 text-white flex flex-col shadow-2xl animate-fade-slide-down" style={{ animation: 'slideInLeft 0.25s ease-out both' }}>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-green-800">
              <span className="text-xl font-black">
                <span className="text-white">CESI</span>
                <span className="text-yellow-400">Zen</span>
              </span>
              <button type="button" onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-green-300 hover:bg-green-800 transition-colors"
                aria-label="Fermer le menu">
                <span className="material-symbols-rounded text-xl">close</span>
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      isActive ? 'bg-green-800 text-white' : 'text-green-300 hover:bg-green-800/50 hover:text-white'
                    }`}>
                    <span className="material-symbols-rounded text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User info + logout */}
            <div className="p-4 border-t border-green-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{userName}</p>
                  <p className="text-xs text-green-400 truncate">{userEmail}</p>
                </div>
              </div>
              <button type="button" onClick={handleSignOut}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors">
                <span className="material-symbols-rounded text-lg">logout</span> Déconnexion
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

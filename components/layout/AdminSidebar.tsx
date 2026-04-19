'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/users', label: 'Utilisateurs', icon: 'group', exact: false },
  { href: '/admin/info-pages', label: 'Articles', icon: 'article', exact: false },
  { href: '/admin/menu', label: 'Menu', icon: 'menu_book', exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-green-900 text-white shrink-0 flex flex-col hidden lg:flex">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && !item.exact;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-green-800 text-white' : 'text-green-300 hover:bg-green-800/50 hover:text-white'
              }`}>
              <span className="material-symbols-rounded text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-green-800">
        <button type="button" onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors">
          <span className="material-symbols-rounded text-lg">logout</span> Déconnexion
        </button>
      </div>
    </aside>
  );
}

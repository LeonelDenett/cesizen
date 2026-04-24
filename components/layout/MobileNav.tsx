'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function MobileNav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button type="button" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}
        className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        onClick={() => setOpen(!open)}>
        <span className="material-symbols-rounded text-2xl">{open ? 'close' : 'menu'}</span>
      </button>

      {open && (
        <nav aria-label="Menu mobile" className="absolute left-0 right-0 top-full z-50 border-b border-gray-200 bg-white shadow-lg">
          <ul className="flex flex-col px-4 py-3 space-y-1">
            <li><Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"><span className="material-symbols-rounded text-lg">home</span> Accueil</Link></li>
            <li><Link href="/a-propos" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"><span className="material-symbols-rounded text-lg">info</span> À propos</Link></li>
            <li><Link href="/respiration" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"><span className="material-symbols-rounded text-lg">self_improvement</span> Respiration</Link></li>
            <li><Link href="/articles" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"><span className="material-symbols-rounded text-lg">article</span> Articles</Link></li>
            <li><Link href="/sante" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"><span className="material-symbols-rounded text-lg">favorite</span> Santé</Link></li>

            <li className="border-t border-gray-100 pt-2 mt-2">
              {session?.user ? (
                <button type="button" onClick={() => { signOut({ callbackUrl: '/' }); setOpen(false); }}
                  className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <span className="material-symbols-rounded text-lg">logout</span> Déconnexion
                </button>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 flex items-center gap-2">
                  <span className="material-symbols-rounded text-lg">login</span> Se connecter
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

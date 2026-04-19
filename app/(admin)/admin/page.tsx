import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Bienvenue dans l&apos;espace d&apos;administration CESIZen.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users" className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-green-200 transition-all">
          <span className="material-symbols-rounded text-3xl text-green-600 mb-3 block">group</span>
          <h3 className="font-bold text-gray-900 group-hover:text-green-700">Utilisateurs</h3>
          <p className="text-sm text-gray-500 mt-1">Créer, modifier, désactiver ou supprimer des comptes.</p>
        </Link>

        <Link href="/admin/info-pages" className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-green-200 transition-all">
          <span className="material-symbols-rounded text-3xl text-green-600 mb-3 block">article</span>
          <h3 className="font-bold text-gray-900 group-hover:text-green-700">Articles santé</h3>
          <p className="text-sm text-gray-500 mt-1">Gérer les articles, modifier le contenu, publier ou mettre en brouillon.</p>
        </Link>

        <Link href="/admin/menu" className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-green-200 transition-all">
          <span className="material-symbols-rounded text-3xl text-green-600 mb-3 block">menu_book</span>
          <h3 className="font-bold text-gray-900 group-hover:text-green-700">Menu navigation</h3>
          <p className="text-sm text-gray-500 mt-1">Configurer les éléments du menu dynamique du site.</p>
        </Link>
      </div>
    </div>
  );
}

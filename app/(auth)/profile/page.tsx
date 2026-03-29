import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { formatDateFR } from '@/lib/utils';
import ProfileForm from '@/components/forms/ProfileForm';

export const metadata = {
  title: 'Mon profil — CESIZen',
};

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const [userData] = await db
    .select({
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);

  if (!userData) {
    redirect('/login');
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

        <section className="bg-white rounded-xl shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations du compte
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-medium text-gray-500">Nom</dt>
              <dd className="text-gray-900">{userData.name}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-medium text-gray-500">Email</dt>
              <dd className="text-gray-900">{userData.email}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="font-medium text-gray-500">Membre depuis</dt>
              <dd className="text-gray-900">{formatDateFR(userData.createdAt)}</dd>
            </div>
          </dl>
        </section>

        <ProfileForm name={userData.name} email={userData.email} />
      </div>
    </main>
  );
}

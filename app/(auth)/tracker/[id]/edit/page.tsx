import EditEntryClient from '@/components/tracker/EditEntryClient';

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Modifier l&apos;entrée
        </h1>
        <EditEntryClient entryId={id} />
      </div>
    </section>
  );
}

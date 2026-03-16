import { getTranslations } from 'next-intl/server';

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string, locale: string }>;
}) {
  const { id, locale } = await params;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inspection: {id}</h1>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">
          In Draft
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Inspection Checklist</h2>
            <p className="text-muted-foreground">Checklist progress will appear here (Phase 2).</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium mb-3 opacity-50 cursor-not-allowed">
              Generate Report (Phase 3)
            </button>
            <button className="w-full border border-border py-2 rounded-lg font-medium">
              View Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

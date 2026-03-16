import { getTranslations } from 'next-intl/server';

export default async function NewInspectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">New Roof Inspection</h1>
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Property Address</label>
            <input 
              type="text" 
              className="w-full p-2 border border-border rounded-md bg-background"
              placeholder="123 Roof St, City, State"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Roof Type</label>
            <select className="w-full p-2 border border-border rounded-md bg-background">
              <option>Asphalt Shingle</option>
              <option>Metal</option>
              <option>Tile</option>
              <option>Wood Shake</option>
              <option>Flat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Inspector Name</label>
            <input 
              type="text" 
              className="w-full p-2 border border-border rounded-md bg-background"
              placeholder="John Doe"
            />
          </div>
          <button 
            type="button"
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity mt-4"
          >
            Start Checklist
          </button>
        </form>
      </div>
    </div>
  );
}

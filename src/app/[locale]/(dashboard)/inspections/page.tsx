import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Home } from 'lucide-react';

import { getAuth } from '@/core/auth';
import { getUserInspections } from '@/shared/models/inspection';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { Link } from '@/core/i18n/navigation';

export default async function InspectionsListPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const inspections = await getUserInspections(session.user.id);

  return (
    <div className="container mx-auto py-10 max-w-6xl px-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>My Inspections</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Roof Inspections</h1>
          <p className="text-muted-foreground">
            Manage and review your roof inspection reports
          </p>
        </div>
        <Button asChild>
          <a href="/inspections/new">
            <Plus className="w-4 h-4 mr-2" />
            New Inspection
          </a>
        </Button>
      </div>

      {inspections.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Inspections Yet</CardTitle>
            <CardDescription>
              Create your first roof inspection to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <a href="/inspections/new">
                <Plus className="w-4 h-4 mr-2" />
                Create First Inspection
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspections.map((inspection) => {
            const statusColors = {
              draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
              processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
              review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
              complete: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            };

            return (
              <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{inspection.address}</CardTitle>
                      <CardDescription className="mt-1">
                        {inspection.roofType || 'Unknown roof type'}
                      </CardDescription>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                        statusColors[inspection.status as keyof typeof statusColors] ||
                        statusColors.draft
                      }`}
                    >
                      {inspection.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(inspection.createdAt).toLocaleDateString()}
                    </div>
                    <Button
                      asChild
                      className="w-full"
                      variant={inspection.status === 'draft' ? 'default' : 'outline'}
                    >
                      <a href={`/inspections/${inspection.id}`}>
                        {inspection.status === 'draft'
                          ? 'Continue Checklist'
                          : 'View Details'}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

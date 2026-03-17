import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeft, Camera, FileText, Home } from 'lucide-react';

import { getAuth } from '@/core/auth';
import { findInspectionById } from '@/shared/models/inspection';
import { getInspectionPhotos, type Photo } from '@/shared/models/photo';
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

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    notFound();
  }

  const inspection = await findInspectionById(id);
  if (!inspection) {
    notFound();
  }

  const photos = await getInspectionPhotos(id);
  const completedPhotos = photos.filter((p) => p.processedUrl).length;
  const totalPhotos = 12;

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    complete: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <div className="container mx-auto py-10 max-w-6xl px-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/inspections">My Inspections</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-[200px]">
              {inspection.address}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <a href="/inspections">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inspections
          </a>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{inspection.address}</h1>
            <p className="text-muted-foreground">
              {inspection.roofType || 'Unknown roof type'} • Created{' '}
              {new Date(inspection.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`text-sm font-semibold px-3 py-1 rounded whitespace-nowrap ${
              statusColors[inspection.status as keyof typeof statusColors] ||
              statusColors.draft
            }`}
          >
            {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Photo Checklist Progress</CardTitle>
              <CardDescription>
                {completedPhotos} of {totalPhotos} photos completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${(completedPhotos / totalPhotos) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {Array.from({ length: totalPhotos }, (_, i) => {
                  const photoNumber = i + 1;
                  const hasPhoto = photos.some((p: Photo) => {
                    const order = {
                      north_elevation: 1,
                      south_elevation: 2,
                      east_elevation: 3,
                      west_elevation: 4,
                      roof_plane_north: 5,
                      roof_plane_south: 6,
                      roof_plane_east: 7,
                      roof_plane_west: 8,
                      flashing_chimney: 9,
                      flashing_valley: 10,
                      flashing_wall: 11,
                      penetration_vents: 12,
                    } as const;
                    return order[p.photoType as keyof typeof order] === photoNumber;
                  });

                  return (
                    <div
                      key={photoNumber}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                        hasPhoto
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {photoNumber}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Photos</CardTitle>
              <CardDescription>
                {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {photos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No photos uploaded yet
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((photo: Photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square relative rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={photo.storageUrl}
                        alt={photo.photoType}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                        {photo.photoType.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inspection.status === 'draft' && (
                <Button asChild className="w-full">
                  <a href={`/inspections/${id}/capture`}>
                    <Camera className="w-4 h-4 mr-2" />
                    Continue Checklist
                  </a>
                </Button>
              )}
              {inspection.status === 'processing' && (
                <Button disabled className="w-full">
                  Processing Photos...
                </Button>
              )}
              {inspection.status === 'review' && (
                <Button asChild className="w-full">
                  <a href={`/inspections/${id}/review`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Review Report
                  </a>
                </Button>
              )}
              {inspection.status === 'complete' && (
                <Button asChild className="w-full" variant="outline">
                  <a href={`/inspections/${id}/report`}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Report
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{inspection.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Roof Type:</span>
                <span className="font-medium">{inspection.roofType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {new Date(inspection.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

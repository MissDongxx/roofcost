'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Image as ImageIcon, Check, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { getPhotoTypesOrdered, type PhotoType } from '@/config/photo-types';

interface UploadedPhoto {
  photoType: string;
  photoId: string;
  storageUrl: string;
  timestamp: number;
}

export default function PhotoCapturePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const [inspectionId, setInspectionId] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photoTypes, setPhotoTypes] = useState<PhotoType[]>([]);

  useEffect(() => {
    params.then(({ id }) => {
      setInspectionId(id);
    });
    setPhotoTypes(getPhotoTypesOrdered());
  }, [params]);

  const currentStep = photoTypes[currentStepIndex];
  const completedSteps = uploadedPhotos.length;
  const progress = (completedSteps / photoTypes.length) * 100;

  const hasPhotoForType = useCallback(
    (photoType: string) => {
      return uploadedPhotos.some((p) => p.photoType === photoType);
    },
    [uploadedPhotos]
  );

  const getPhotoForType = useCallback(
    (photoType: string) => {
      return uploadedPhotos.find((p) => p.photoType === photoType);
    },
    [uploadedPhotos]
  );

  const handleCameraCapture = useCallback(async () => {
    if (!currentStep) return;

    // Check if device supports camera
    const hasCamera = await checkCameraSupport();
    if (!hasCamera) {
      handleFileInputClick();
      return;
    }

    // Create file input for camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Rear camera

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handlePhotoUpload(file);
      }
    };

    input.click();
  }, [currentStep]);

  const checkCameraSupport = async (): Promise<boolean> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((device) => device.kind === 'videoinput');
    } catch {
      return false;
    }
  };

  const handleFileInputClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handlePhotoUpload(file);
      }
    };

    input.click();
  }, []);

  const handlePhotoUpload = async (file: File) => {
    if (!currentStep || !inspectionId) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('photo_type', currentStep.id);
      formData.append('inspection_id', inspectionId);

      if (currentLocation) {
        formData.append('gps', JSON.stringify(currentLocation));
      }

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const data = await response.json();

      // Add to uploaded photos
      setUploadedPhotos((prev) => [
        ...prev.filter((p) => p.photoType !== currentStep.id),
        {
          photoType: currentStep.id,
          photoId: data.id,
          storageUrl: data.storage_url,
          timestamp: Date.now(),
        },
      ]);

      toast.success('Photo uploaded successfully');

      // Auto-advance to next step
      if (currentStepIndex < photoTypes.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      toast.success('Location captured successfully');
    } catch (error) {
      console.error('Geolocation error:', error);
      toast.error('Failed to get location. Please enable location services.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleRetake = (photoType: string) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.photoType !== photoType));
    const index = photoTypes.findIndex((p) => p.id === photoType);
    if (index !== -1) {
      setCurrentStepIndex(index);
    }
  };

  const handleFinish = () => {
    router.push(`/inspections/${inspectionId}`);
  };

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">Photo Checklist</h1>
            <span className="text-sm text-muted-foreground">
              {completedSteps} / {photoTypes.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Current Step */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
              {currentStep.order}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{currentStep.name}</h2>
              <p className="text-muted-foreground">{currentStep.description}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm font-medium mb-1">Instructions:</p>
            <p className="text-sm text-muted-foreground">
              {currentStep.instructions}
            </p>
          </div>

          {/* Already uploaded thumbnail */}
          {hasPhotoForType(currentStep.id) && (
            <div className="mb-6">
              <div className="relative inline-block">
                <img
                  src={getPhotoForType(currentStep.id)?.storageUrl}
                  alt={currentStep.name}
                  className="w-32 h-32 object-cover rounded-lg border border-border"
                />
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                     onClick={() => handleRetake(currentStep.id)}>
                  <span className="text-white text-sm font-medium">Retake</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              onClick={handleCameraCapture}
              disabled={isUploading || hasPhotoForType(currentStep.id)}
              size="lg"
              className="w-full"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 mr-2" />
              )}
              Camera
            </Button>
            <Button
              onClick={handleFileInputClick}
              disabled={isUploading || hasPhotoForType(currentStep.id)}
              variant="outline"
              size="lg"
              className="w-full"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5 mr-2" />
              )}
              Gallery
            </Button>
          </div>

          {/* GPS Button */}
          <Button
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            {currentLocation
              ? `Location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
              : 'Add GPS Location (Optional)'}
          </Button>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            variant="outline"
          >
            Previous
          </Button>

          {completedSteps === photoTypes.length ? (
            <Button onClick={handleFinish} size="lg">
              Finish & Generate Report
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStepIndex((prev) => Math.min(photoTypes.length - 1, prev + 1))}
              disabled={currentStepIndex === photoTypes.length - 1}
              variant="outline"
            >
              Next
            </Button>
          )}
        </div>

        {/* All Steps Overview */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold mb-3">All Steps</h3>
          <div className="grid grid-cols-4 gap-2">
            {photoTypes.map((step) => {
              const hasPhoto = hasPhotoForType(step.id);
              const isCurrent = step.id === currentStep.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(step.order - 1)}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center font-medium text-sm
                    ${hasPhoto ? 'bg-green-100 text-green-800 border-2 border-green-500' : 'bg-muted'}
                    ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                    transition-all
                  `}
                >
                  {hasPhoto ? <Check className="w-5 h-5" /> : step.order}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

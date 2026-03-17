'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  detail: string;
}

interface PipelineStatusResponse {
  success: boolean;
  inspection: {
    id: string;
    status: string;
    address: string;
    roofType: string | null;
  };
  progress: {
    currentStep: number;
    totalSteps: number;
    percentage: number;
    completedSteps: number;
    isComplete: boolean;
  };
  photos: {
    total: number;
    uploaded: number;
    processed: number;
    annotated: number;
    withErrors: number;
  };
  observations: {
    total: number;
    classified: number;
    withoutClassification: number;
  };
  scopeItems: {
    total: number;
    confirmed: number;
    pending: number;
    deleted: number;
  };
  steps: PipelineStep[];
}

interface PipelineProgressProps {
  inspectionId: string;
  onComplete?: () => void;
  autoRedirect?: boolean;
  pollInterval?: number;
}

export function PipelineProgress({
  inspectionId,
  onComplete,
  autoRedirect = true,
  pollInterval = 2000,
}: PipelineProgressProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PipelineStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const response = await fetch(
          `/api/pipeline/status?inspection_id=${inspectionId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch pipeline status');
        }

        const data: PipelineStatusResponse = await response.json();

        if (mounted) {
          setStatus(data);
          setError(null);

          // Check if pipeline is complete
          if (data.progress.isComplete) {
            setIsPolling(false);
            if (onComplete) {
              onComplete();
            }
            if (autoRedirect) {
              // Redirect to review page after a short delay
              timeoutId = setTimeout(() => {
                router.push(`/inspections/${inspectionId}/review`);
              }, 1500);
            }
            return;
          }

          // Continue polling
          if (isPolling) {
            timeoutId = setTimeout(pollStatus, pollInterval);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setIsPolling(false);
        }
      }
    };

    pollStatus();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [inspectionId, pollInterval, isPolling, onComplete, autoRedirect, router]);

  const handleRetry = () => {
    setError(null);
    setIsPolling(true);
  };

  const handleStopPolling = () => {
    setIsPolling(false);
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-red-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Pipeline Status Error
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
            <button
              onClick={handleStopPolling}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pipeline status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              AI Pipeline Progress
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {status.inspection.address}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {status.progress.percentage}%
            </div>
            <div className="text-sm text-gray-600">
              Step {status.progress.currentStep} of {status.progress.totalSteps}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${status.progress.percentage}%` }}
          />
        </div>

        {/* Status Indicator */}
        {isPolling && !status.progress.isComplete && (
          <div className="mt-4 flex items-center justify-center text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Processing...
          </div>
        )}

        {status.progress.isComplete && (
          <div className="mt-4 flex items-center justify-center text-sm text-green-600">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Pipeline Complete! Redirecting to review...
          </div>
        )}
      </div>

      {/* Steps List */}
      <div className="bg-white rounded-lg shadow divide-y">
        {status.steps.map((step, index) => (
          <div key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                {/* Status Icon */}
                <div className="flex-shrink-0 mr-4">
                  {step.status === 'completed' && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                  {step.status === 'running' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {step.status === 'pending' && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                  {step.status === 'failed' && (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {step.name}
                    </h4>
                    <span className="text-xs text-gray-500 ml-4">
                      {step.detail}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {status.photos.uploaded}
          </div>
          <div className="text-sm text-gray-600">Photos Uploaded</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {status.observations.total}
          </div>
          <div className="text-sm text-gray-600">Observations</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {status.scopeItems.total}
          </div>
          <div className="text-sm text-gray-600">Scope Items</div>
        </div>
      </div>

      {/* Error Warning */}
      {(status.photos.withErrors > 0 || status.observations.withoutClassification > 0) && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-900">
                Some items had issues
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                {status.photos.withErrors > 0 && (
                  <span>{status.photos.withErrors} photos failed to process. </span>
                )}
                {status.observations.withoutClassification > 0 && (
                  <span>
                    {status.observations.withoutClassification} observations couldn't be
                    classified.
                  </span>
                )}
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                The pipeline will continue with available data. You can retry failed
                items in the review step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Navigation */}
      {!isPolling && !status.progress.isComplete && (
        <div className="mt-6 text-center">
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Resume Polling
          </button>
        </div>
      )}
    </div>
  );
}

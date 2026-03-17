'use client';

import { useState } from 'react';
import { Download, Home, Calendar, FileText } from 'lucide-react';

import type { Report } from '@/shared/models/report';
import type { Inspection } from '@/shared/models/inspection';

interface ShareReportClientProps {
  report: Report;
  inspection: Inspection;
}

export default function ShareReportClient({ report, inspection }: ShareReportClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      // Direct download from storage URL
      window.open(report.storageUrl, '_blank');
    } catch (err) {
      setError('Failed to download report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header Card */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Roof Inspection Report</h1>
              <p className="mt-2 text-gray-600">Professional Property Assessment</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Property Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start space-x-3">
              <Home className="mt-1 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Property Address</p>
                <p className="text-lg font-semibold text-gray-900">{inspection.address}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="mt-1 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Inspection Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(inspection.createdAt)}
                </p>
              </div>
            </div>

            {inspection.roofType && (
              <div className="flex items-start space-x-3">
                <FileText className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Roof Type</p>
                  <p className="text-lg font-semibold text-gray-900">{inspection.roofType}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <FileText className="mt-1 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Report Status</p>
                <p className="text-lg font-semibold text-green-600">
                  {inspection.status === 'complete' ? 'Complete' : 'In Progress'}
                </p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="mt-8">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              <span>{loading ? 'Downloading...' : 'Download Full Report (PDF)'}</span>
            </button>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-xl bg-white/80 p-6 backdrop-blur-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">About This Report</h2>
          <p className="text-gray-600">
            This report contains detailed findings, observations, and recommendations
            based on a visual inspection of the property. The inspection was conducted
            by RoofCost Professional Inspection Services.
          </p>
          <div className="mt-4 rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This report is based on a visual inspection from
              ground level and accessible areas. All findings should be verified by a
              qualified roofing professional before proceeding with any repairs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Generated by RoofCost Professional Inspection Services</p>
          <p className="mt-1">Report ID: {report.id}</p>
        </div>
      </div>
    </div>
  );
}

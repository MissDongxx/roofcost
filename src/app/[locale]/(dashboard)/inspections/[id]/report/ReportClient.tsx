'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Share2, Copy, Check, FileText, CreditCard, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { Inspection } from '@/shared/models/inspection';
import type { Report } from '@/shared/models/report';

interface ReportClientProps {
  inspection: Inspection;
  report: Report | null;
  userCredits: number;
  translations: any;
}

export default function ReportClient({
  inspection,
  report,
  userCredits,
  translations,
}: ReportClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (userCredits <= 0) {
      // Redirect to payment
      router.push('/payment/checkout?product=report');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionId: inspection.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate report');
      }

      const data = await response.json();
      // Refresh to show the generated report
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${report.id}/download`);
      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      // The API redirects to the storage URL
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roof_inspection_${inspection.address.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!report) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${report.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInDays: 30 }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const data = await response.json();
      setShareLink(data.shareUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy link to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Inspection Report</h1>
                <p className="text-sm text-gray-500">{inspection.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {userCredits} Credit{userCredits !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Report Status Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {report ? (
            <>
              {/* Report Ready */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Report Ready!</h2>
                <p className="mt-2 text-gray-600">
                  Your roof inspection report has been generated successfully.
                </p>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
                  <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="inline-flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                    <span>Download PDF</span>
                  </button>

                  {!shareLink ? (
                    <button
                      onClick={handleGenerateShareLink}
                      disabled={loading}
                      className="inline-flex items-center justify-center space-x-2 rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Share2 className="h-5 w-5" />
                      )}
                      <span>Share Report</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleCopyShareLink}
                      className="inline-flex items-center justify-center space-x-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                    >
                      {copied ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  )}
                </div>

                {shareLink && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">Share link:</p>
                    <p className="mt-1 break-all text-sm font-medium text-gray-900">
                      {shareLink}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Generate Report */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Generate Your Report</h2>
                <p className="mt-2 text-gray-600">
                  Generate a professional PDF report with all inspection findings,
                  photos, and recommendations.
                </p>

                {/* Credits Info */}
                <div className="mt-6 rounded-xl bg-gray-50 p-6">
                  {userCredits > 0 ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm text-gray-600">You have</span>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
                        {userCredits} credit{userCredits !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm text-gray-600">available</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 text-red-600">
                      <CreditCard className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        No credits available. Purchase a credit to generate your report.
                      </span>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <div className="mt-8">
                  <button
                    onClick={handleGenerateReport}
                    disabled={generating}
                    className="inline-flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generating ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                    <span>
                      {userCredits > 0 ? 'Generate Report' : 'Purchase Credit ($39)'}
                    </span>
                  </button>

                  {userCredits > 0 && (
                    <p className="mt-3 text-sm text-gray-500">
                      1 credit will be deducted to generate this report
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Report Info Card */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-md">
          <h3 className="font-semibold text-gray-900">What's Included in Your Report</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Professional cover page with property details</li>
            <li>• Comprehensive roof condition assessment</li>
            <li>• All inspection photos with annotations</li>
            <li>• Detailed scope of work with Xactimate codes</li>
            <li>• Observations organized by component</li>
            <li>• Glossary of roofing terms</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

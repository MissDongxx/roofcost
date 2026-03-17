'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ScopeItem {
  id: string;
  xactimateCode: string | null;
  lineItem: string | null;
  description: string | null;
  confirmed: boolean;
  deleted: boolean;
}

interface ReviewData {
  inspection: {
    id: string;
    address: string;
    roofType: string | null;
    status: string;
  };
  scopeItems: ScopeItem[];
  reviewStatus: {
    total: number;
    confirmed: number;
    deleted: number;
    pending: number;
    allReviewed: boolean;
  };
}

interface ReviewClientProps {
  inspectionId: string;
  translations: any;
}

export default function ReviewClient({ inspectionId, translations }: ReviewClientProps) {
  const router = useRouter();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviewData();
  }, [inspectionId]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inspections/${inspectionId}/review`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load review data');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (scopeItemId: string, action: 'confirm' | 'delete' | 'edit', description?: string) => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/inspections/${inspectionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scopeItemId,
          action,
          description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Action failed');
      }

      // Refresh data
      await fetchReviewData();
      setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: ScopeItem) => {
    setEditingId(item.id);
    setEditDescription(item.description || '');
  };

  const handleSaveEdit = async (scopeItemId: string) => {
    await handleAction(scopeItemId, 'edit', editDescription);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
  };

  const handleGenerateReport = async () => {
    // Check user credits before generating report
    try {
      const response = await fetch('/api/user/get-user-credits');
      if (!response.ok) {
        throw new Error('Failed to check credits');
      }
      const { credits } = await response.json();

      if (credits <= 0) {
        // Redirect to payment page
        router.push(`/payment/checkout?product=report&inspectionId=${inspectionId}`);
        return;
      }

      // User has credits, proceed to report generation page
      router.push(`/inspections/${inspectionId}/report`);
    } catch (err) {
      alert('Failed to check credits. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchReviewData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pendingItems = data.scopeItems.filter((item) => !item.deleted);
  const confirmedItems = pendingItems.filter((item) => item.confirmed);
  const notReviewedItems = pendingItems.filter((item) => !item.confirmed);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Scope Items</h1>
        <p className="text-gray-600">{data.inspection.address}</p>
        <p className="text-sm text-gray-500">Roof Type: {data.inspection.roofType || 'Not specified'}</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Review Progress</h2>
          <span className="text-sm text-gray-600">
            {confirmedItems.length} / {notReviewedItems.length + confirmedItems.length} reviewed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${notReviewedItems.length + confirmedItems.length > 0
                ? (confirmedItems.length / (notReviewedItems.length + confirmedItems.length)) * 100
                : 0}%`
            }}
          ></div>
        </div>
        {data.reviewStatus.allReviewed && notReviewedItems.length === 0 && confirmedItems.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGenerateReport}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Generate Report
            </button>
          </div>
        )}
      </div>

      {/* Scope Items List */}
      <div className="space-y-4">
        {notReviewedItems.length === 0 && confirmedItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No scope items to review.</p>
            <button
              onClick={() => router.push(`/inspections/${inspectionId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Inspection
            </button>
          </div>
        ) : (
          data.scopeItems
            .filter((item) => !item.deleted)
            .map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow p-6 ${item.confirmed ? 'border-l-4 border-green-500' : ''}`}
              >
                {editingId === item.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Line Item: {item.lineItem}
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter description..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        disabled={submitting || !editDescription.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={submitting}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            {item.xactimateCode || 'N/A'}
                          </span>
                          {item.confirmed && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Confirmed
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.lineItem || 'Untitled Scope Item'}
                        </h3>
                        {item.description && (
                          <p className="text-gray-700">{item.description}</p>
                        )}
                      </div>
                    </div>

                    {!item.confirmed && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleAction(item.id, 'confirm')}
                          disabled={submitting}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Confirm
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          disabled={submitting}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'delete')}
                          disabled={submitting}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
        )}
      </div>

      {/* Deleted Items Summary */}
      {data.reviewStatus.deleted > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            {data.reviewStatus.deleted} item(s) deleted
          </p>
        </div>
      )}
    </div>
  );
}

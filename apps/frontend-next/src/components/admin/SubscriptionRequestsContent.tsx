'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/i18n/TranslationContext';
import {
  getAllSubscriptionRequests,
  reviewSubscriptionRequest,
  SubscriptionRequest,
  SubscriptionRequestStatus,
  SubscriptionRequestType,
  CoachTier,
} from '@/lib/api/subscription-requests';
import { X, Eye, Check, XCircle } from 'lucide-react';

export default function SubscriptionRequestsContent() {
  const t = useTranslations('adminDashboard');
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SubscriptionRequestStatus | 'ALL'>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getAllSubscriptionRequests(
        filter !== 'ALL' ? { status: filter as SubscriptionRequestStatus } : undefined
      );
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setReviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setReviewModalOpen(false);
    setSelectedRequest(null);
  };

  const handleReviewSuccess = () => {
    fetchRequests();
    handleCloseModal();
  };

  const pendingCount = requests.filter(
    (r) => r.status === SubscriptionRequestStatus.PENDING
  ).length;

  const getStatusBadgeClass = (status: SubscriptionRequestStatus) => {
    switch (status) {
      case SubscriptionRequestStatus.PENDING:
        return 'bg-blue-100 text-blue-800';
      case SubscriptionRequestStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case SubscriptionRequestStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case SubscriptionRequestStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeClass = (type: SubscriptionRequestType) => {
    return type === SubscriptionRequestType.PREMIUM
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brandText">
            {t('subscriptionRequests.title')}
          </h1>
          <p className="text-brandText/60 mt-1">
            {t('subscriptionRequests.subtitle')}
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-brandGreen/10 border border-brandGreen/30 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-brandGreen">
              {pendingCount} {t('subscriptionRequests.pending')}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? 'bg-brandGreen text-white'
                : 'bg-white border border-brandBorder text-brandText hover:bg-brandSurface'
            }`}
          >
            {t(`subscriptionRequests.filters.${status.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-brandBorder">
          <p className="text-brandText/60">{t('subscriptionRequests.loading')}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-brandBorder">
          <p className="text-brandText/60">{t('subscriptionRequests.noRequests')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brandBorder overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brandSurface border-b border-brandBorder">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-brandText">
                    {t('subscriptionRequests.table.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-brandText">
                    {t('subscriptionRequests.table.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-brandText">
                    {t('subscriptionRequests.table.tier')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-brandText">
                    {t('subscriptionRequests.table.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-brandText">
                    {t('subscriptionRequests.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-brandText">
                    {t('subscriptionRequests.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-brandBorder hover:bg-brandSurface/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-brandText">
                          {request.user?.displayName || t('subscriptionRequests.unknownUser')}
                        </p>
                        <p className="text-sm text-brandText/60">{request.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeClass(
                          request.requestType
                        )}`}
                      >
                        {request.requestType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-brandText">
                      {request.coachTier || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-brandText/60">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="text-brandGreen hover:text-brandGreen/80 transition"
                        title={t('subscriptionRequests.viewDetails')}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedRequest && (
        <ReviewModal
          request={selectedRequest}
          onClose={handleCloseModal}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}

// Review Modal Component
interface ReviewModalProps {
  request: SubscriptionRequest;
  onClose: () => void;
  onSuccess: () => void;
}

function ReviewModal({ request, onClose, onSuccess }: ReviewModalProps) {
  const t = useTranslations('adminDashboard');
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async (status: SubscriptionRequestStatus) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await reviewSubscriptionRequest(request.id, {
        status,
        adminNotes: adminNotes || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || t('subscriptionRequests.errorReviewing'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = request.status === SubscriptionRequestStatus.PENDING;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-brandBorder px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brandText">
            {t('subscriptionRequests.reviewTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-brandText/50 hover:text-brandText transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-6">
          {/* User Info */}
          <div>
            <h3 className="text-sm font-medium text-brandText mb-2">
              {t('subscriptionRequests.userInfo')}
            </h3>
            <div className="bg-brandSurface rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">{t('subscriptionRequests.name')}:</span>{' '}
                {request.user?.displayName || t('subscriptionRequests.unknownUser')}
              </p>
              <p className="text-sm">
                <span className="font-medium">{t('subscriptionRequests.email')}:</span>{' '}
                {request.user?.email}
              </p>
            </div>
          </div>

          {/* Request Details */}
          <div>
            <h3 className="text-sm font-medium text-brandText mb-2">
              {t('subscriptionRequests.requestDetails')}
            </h3>
            <div className="bg-brandSurface rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">{t('subscriptionRequests.requestType')}:</span>{' '}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.requestType === SubscriptionRequestType.PREMIUM
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {request.requestType}
                </span>
              </p>
              {request.coachTier && (
                <p className="text-sm">
                  <span className="font-medium">{t('subscriptionRequests.tier')}:</span>{' '}
                  {request.coachTier}
                </p>
              )}
              <p className="text-sm">
                <span className="font-medium">{t('subscriptionRequests.submittedOn')}:</span>{' '}
                {new Date(request.createdAt).toLocaleString()}
              </p>
              <p className="text-sm">
                <span className="font-medium">{t('subscriptionRequests.currentStatus')}:</span>{' '}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === SubscriptionRequestStatus.PENDING
                      ? 'bg-blue-100 text-blue-800'
                      : request.status === SubscriptionRequestStatus.APPROVED
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {request.status}
                </span>
              </p>
            </div>
          </div>

          {/* Motivation */}
          {request.motivation && (
            <div>
              <h3 className="text-sm font-medium text-brandText mb-2">
                {t('subscriptionRequests.motivation')}
              </h3>
              <div className="bg-brandSurface rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{request.motivation}</p>
              </div>
            </div>
          )}

          {/* Experience (Coach only) */}
          {request.experience && (
            <div>
              <h3 className="text-sm font-medium text-brandText mb-2">
                {t('subscriptionRequests.experience')}
              </h3>
              <div className="bg-brandSurface rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{request.experience}</p>
              </div>
            </div>
          )}

          {/* Previous Review (if exists) */}
          {request.reviewedBy && (
            <div>
              <h3 className="text-sm font-medium text-brandText mb-2">
                {t('subscriptionRequests.previousReview')}
              </h3>
              <div className="bg-brandSurface rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">{t('subscriptionRequests.reviewedBy')}:</span>{' '}
                  {request.reviewedByUser?.displayName || t('subscriptionRequests.unknownAdmin')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('subscriptionRequests.reviewedOn')}:</span>{' '}
                  {request.reviewedAt && new Date(request.reviewedAt).toLocaleString()}
                </p>
                {request.adminNotes && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">
                      {t('subscriptionRequests.adminNotes')}:
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{request.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes (editable for pending requests) */}
          {isPending && (
            <div>
              <label className="block text-sm font-medium text-brandText mb-2">
                {t('subscriptionRequests.adminNotes')}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                placeholder={t('subscriptionRequests.adminNotesPlaceholder')}
              />
              <p className="text-xs text-brandText/60 mt-1">{adminNotes.length}/1000</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t border-brandBorder">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-brandBorder rounded-lg hover:bg-brandSurface transition"
            >
              {t('subscriptionRequests.close')}
            </button>
            {isPending && (
              <>
                <button
                  onClick={() => handleReview(SubscriptionRequestStatus.REJECTED)}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  {isSubmitting ? t('subscriptionRequests.processing') : t('subscriptionRequests.reject')}
                </button>
                <button
                  onClick={() => handleReview(SubscriptionRequestStatus.APPROVED)}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-brandGreen text-white rounded-lg hover:bg-brandGreen/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting ? t('subscriptionRequests.processing') : t('subscriptionRequests.approve')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

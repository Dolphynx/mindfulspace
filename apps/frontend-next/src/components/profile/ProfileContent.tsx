"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  revokeSession,
  revokeAllOtherSessions,
  unlinkOAuthProvider,
  exportUserData,
  deleteAccount,
  type UserProfile,
} from "@/lib/api/users";
import UpgradeRequestModal from "@/components/subscription/UpgradeRequestModal";
import {
  SubscriptionRequestType,
  SubscriptionRequest,
  SubscriptionRequestStatus,
  CoachTier,
  getMySubscriptionRequests,
  cancelSubscriptionRequest,
} from "@/lib/api/subscription-requests";
import { ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Ban } from "lucide-react";

interface ProfileContentProps {
  /** Optional: Show page header (title + subtitle). Default: true */
  showHeader?: boolean;
  /** Optional: Custom wrapper className for the container */
  containerClassName?: string;
}

/**
 * ProfileContent Component
 * Reusable user profile settings component that can be used in both
 * the member area and admin panel.
 */
export default function ProfileContent({
  showHeader = true,
  containerClassName = "min-h-screen bg-brandSurface py-8",
}: ProfileContentProps) {
  const t = useTranslations("profile");
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Loading states
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Success messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Upgrade modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<SubscriptionRequestType | null>(null);

  // Subscription requests state
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsExpanded, setRequestsExpanded] = useState(false);
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const handleOpenUpgradeModal = (type: SubscriptionRequestType) => {
    setUpgradeType(type);
    setUpgradeModalOpen(true);
  };

  const handleUpgradeSuccess = () => {
    setSuccessMessage(t("requestSubmittedSuccess"));
    loadProfile(); // Refresh profile to show updated data
    loadSubscriptionRequests(); // Refresh requests list
  };

  const loadSubscriptionRequests = async () => {
    try {
      setRequestsLoading(true);
      const data = await getMySubscriptionRequests();
      setSubscriptionRequests(data);
    } catch (err) {
      console.error("Failed to load subscription requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm(t("cancelRequestConfirm"))) return;

    try {
      setCancellingRequestId(requestId);
      await cancelSubscriptionRequest(requestId);
      setSuccessMessage(t("requestCancelledSuccess"));
      await loadSubscriptionRequests();
      await loadProfile();
    } catch (err: any) {
      setError(err.message || t("errorCancellingRequest"));
    } finally {
      setCancellingRequestId(null);
    }
  };

  const toggleRequestsExpanded = () => {
    if (!requestsExpanded && subscriptionRequests.length === 0) {
      loadSubscriptionRequests();
    }
    setRequestsExpanded(!requestsExpanded);
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data);
      setDisplayName(data.displayName || "");
    } catch (err) {
      setError(t("errorLoadingProfile"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      await updateUserProfile({ displayName });
      setSuccessMessage(t("profileUpdatedSuccess"));
      await refreshUser();
      await loadProfile();
    } catch (err: any) {
      setError(err.message || t("errorUpdatingProfile"));
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setChangingPassword(true);
      setError(null);
      await changePassword({ currentPassword, newPassword });
      setSuccessMessage(t("passwordChangedSuccess"));
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || t("errorChangingPassword"));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeSession = async (tokenId: string) => {
    if (!confirm(t("revokeSessionConfirm"))) return;

    try {
      await revokeSession(tokenId);
      setSuccessMessage(t("sessionRevokedSuccess"));
      await loadProfile();
    } catch (err: any) {
      setError(err.message || t("errorRevokingSession"));
    }
  };

  const handleRevokeAllOther = async () => {
    if (!confirm(t("revokeAllConfirm"))) return;

    try {
      await revokeAllOtherSessions();
      setSuccessMessage(t("allSessionsRevokedSuccess"));
      await loadProfile();
    } catch (err: any) {
      setError(err.message || t("errorRevokingSession"));
    }
  };

  const handleUnlinkOAuth = async (provider: string) => {
    if (!confirm(t("unlinkConfirm"))) return;

    try {
      await unlinkOAuthProvider(provider);
      setSuccessMessage(t("unlinkSuccess"));
      await loadProfile();
    } catch (err: any) {
      setError(err.message || t("errorUnlinkingAccount"));
    }
  };

  const handleExportData = async () => {
    try {
      setExportingData(true);
      const blob = await exportUserData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindfulspace-data-${new Date().toISOString()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      setSuccessMessage(t("exportDataSuccess"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      setError(null);
      await deleteAccount(profile?.hasPassword ? deletePassword : undefined);
      setSuccessMessage(t("accountDeletedSuccess"));
      setTimeout(() => {
        logout();
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || t("errorDeletingAccount"));
      setDeletingAccount(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800 border-red-200",
      coach: "bg-purple-100 text-purple-800 border-purple-200",
      premium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      user: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  const getSubscriptionType = () => {
    if (profile?.roles.includes("coach")) return "coach";
    if (profile?.roles.includes("premium")) return "premium";
    return "standard";
  };

  const getSubscriptionBadgeColor = (subscription: string) => {
    const colors = {
      coach: "bg-purple-100 text-purple-800 border-purple-200",
      premium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      standard: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[subscription as keyof typeof colors] || colors.standard;
  };

  const getRequestStatusIcon = (status: SubscriptionRequestStatus) => {
    switch (status) {
      case SubscriptionRequestStatus.PENDING:
        return <Clock className="h-5 w-5 text-blue-600" />;
      case SubscriptionRequestStatus.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case SubscriptionRequestStatus.REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />;
      case SubscriptionRequestStatus.CANCELLED:
        return <Ban className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getRequestStatusBadgeColor = (status: SubscriptionRequestStatus) => {
    switch (status) {
      case SubscriptionRequestStatus.PENDING:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case SubscriptionRequestStatus.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case SubscriptionRequestStatus.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case SubscriptionRequestStatus.CANCELLED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brandSurface flex items-center justify-center">
        <div className="text-brandText">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-brandSurface flex items-center justify-center">
        <div className="text-red-600">{error || t("errorLoadingProfile")}</div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        {showHeader && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brandText">{t("pageTitle")}</h1>
            <p className="text-brandText/70 mt-2">{t("pageSubtitle")}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Phase 1: Account Information */}
        <section className="bg-white rounded-xl border border-brandBorder p-6 mb-6">
          <h2 className="text-xl font-semibold text-brandText mb-4">{t("accountInfoTitle")}</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brandText mb-2">
                {t("displayNameLabel")}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                placeholder={t("displayNamePlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brandText mb-2">
                {t("emailLabel")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="flex-1 px-4 py-2 border border-brandBorder rounded-lg bg-gray-50 text-gray-500"
                />
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    profile.emailVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {profile.emailVerified ? t("emailVerifiedBadge") : t("emailNotVerifiedBadge")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brandText mb-2">
                  {t("accountCreatedLabel")}
                </label>
                <input
                  type="text"
                  value={formatDate(profile.createdAt)}
                  disabled
                  className="w-full px-4 py-2 border border-brandBorder rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brandText mb-2">
                  {t("accountStatusLabel")}
                </label>
                <input
                  type="text"
                  value={profile.isActive ? t("accountStatusActive") : t("accountStatusSuspended")}
                  disabled
                  className="w-full px-4 py-2 border border-brandBorder rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2 bg-brandGreen text-white rounded-lg hover:bg-brandGreen/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "..." : t("updateProfileButton")}
            </button>
          </form>
        </section>

        {/* Phase 2: Security Settings */}
        <section className="bg-white rounded-xl border border-brandBorder p-6 mb-6">
          <h2 className="text-xl font-semibold text-brandText mb-4">{t("securityTitle")}</h2>

          {/* Change Password */}
          {profile.hasPassword ? (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-brandText mb-3">{t("changePasswordTitle")}</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brandText mb-2">
                    {t("currentPasswordLabel")}
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brandText mb-2">
                    {t("newPasswordLabel")}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                    required
                    minLength={8}
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-2 bg-brandGreen text-white rounded-lg hover:bg-brandGreen/90 disabled:opacity-50"
                >
                  {changingPassword ? "..." : t("changePasswordButton")}
                </button>
              </form>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              {t("noPasswordSet")}
            </div>
          )}

          {/* Connected Accounts */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-brandText mb-3">{t("connectedAccountsTitle")}</h3>
            {profile.oauthAccounts.length > 0 ? (
              <div className="space-y-2">
                {profile.oauthAccounts.map((account) => (
                  <div
                    key={account.provider}
                    className="flex items-center justify-between p-3 border border-brandBorder rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-brandText capitalize">{account.provider}</div>
                      <div className="text-sm text-brandText/60">
                        {t("connectedSince")} {formatDate(account.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnlinkOAuth(account.provider)}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                    >
                      {t("unlinkButton")}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brandText/60 text-sm">{t("noConnectedAccounts")}</p>
            )}
          </div>

          {/* Active Sessions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-brandText">{t("activeSessionsTitle")}</h3>
              {profile.refreshTokens.length > 1 && (
                <button
                  onClick={handleRevokeAllOther}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                >
                  {t("revokeAllOtherButton")}
                </button>
              )}
            </div>
            {profile.refreshTokens.length > 0 ? (
              <div className="space-y-2">
                {profile.refreshTokens.map((session, index) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border border-brandBorder rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-brandText">
                          {session.userAgent || t("deviceLabel")}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            {t("currentSessionBadge")}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-brandText/60">
                        {t("ipAddressLabel")}: {session.ipAddress || "N/A"} •{" "}
                        {t("lastActiveLabel")}: {formatDate(session.createdAt)}
                      </div>
                    </div>
                    {index !== 0 && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                      >
                        {t("revokeSessionButton")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brandText/60 text-sm">{t("noActiveSessions")}</p>
            )}
          </div>
        </section>

        {/* Phase 3: Data Privacy */}
        <section className="bg-white rounded-xl border border-brandBorder p-6 mb-6">
          <h2 className="text-xl font-semibold text-brandText mb-4">{t("dataPrivacyTitle")}</h2>

          {/* Export Data */}
          <div className="mb-6 p-4 border border-brandBorder rounded-lg">
            <h3 className="font-medium text-brandText mb-2">{t("exportDataButton")}</h3>
            <p className="text-sm text-brandText/60 mb-3">{t("exportDataDescription")}</p>
            <button
              onClick={handleExportData}
              disabled={exportingData}
              className="px-6 py-2 bg-brandGreen text-white rounded-lg hover:bg-brandGreen/90 disabled:opacity-50"
            >
              {exportingData ? "..." : t("exportDataButton")}
            </button>
          </div>

          {/* Delete Account */}
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h3 className="font-medium text-red-800 mb-2">{t("deleteAccountButton")}</h3>
            <p className="text-sm text-red-700 mb-3">{t("deleteAccountDescription")}</p>
            <p className="text-sm text-red-700 font-medium mb-3">{t("deleteAccountWarning")}</p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t("deleteAccountButton")}
              </button>
            ) : (
              <div className="space-y-3">
                {profile.hasPassword && (
                  <div>
                    <label className="block text-sm font-medium text-red-800 mb-2">
                      {t("deleteAccountPasswordLabel")}
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingAccount ? "..." : t("deleteAccountConfirmButton")}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword("");
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    {t("deleteAccountCancelButton")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Phase 4: Subscription (hidden for admin users) */}
        {!profile.roles.includes("admin") && (
          <section className="bg-white rounded-xl border border-brandBorder p-6">
            <h2 className="text-xl font-semibold text-brandText mb-4">{t("subscriptionTitle")}</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-brandText mb-2">
                {t("currentSubscriptionLabel")}
              </label>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getSubscriptionBadgeColor(
                    getSubscriptionType()
                  )}`}
                >
                  {t(`subscription${getSubscriptionType().charAt(0).toUpperCase() + getSubscriptionType().slice(1)}` as any)}
                </span>
              </div>
            </div>

            {/* Upgrade to Premium - for standard users only */}
            {getSubscriptionType() === "standard" && (
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 mb-4">
                <h3 className="font-medium text-yellow-900 mb-2">{t("upgradeToPremiumButton")}</h3>
                <p className="text-sm text-yellow-800 mb-3">{t("upgradeToPremiumDescription")}</p>
                <ul className="text-sm text-yellow-800 mb-4 space-y-1">
                  <li>• {t("premiumFeature1")}</li>
                  <li>• {t("premiumFeature2")}</li>
                  <li>• {t("premiumFeature3")}</li>
                  <li>• {t("premiumFeature4")}</li>
                </ul>
                <button
                  onClick={() => handleOpenUpgradeModal(SubscriptionRequestType.PREMIUM)}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  {t("upgradeToPremiumButton")}
                </button>
              </div>
            )}

            {/* Become Coach - for standard and premium users */}
            {(getSubscriptionType() === "standard" || getSubscriptionType() === "premium") && (
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <h3 className="font-medium text-purple-900 mb-2">{t("upgradeToCoachButton")}</h3>
                <p className="text-sm text-purple-800 mb-3">{t("upgradeToCoachDescription")}</p>
                <ul className="text-sm text-purple-800 mb-4 space-y-1">
                  <li>• {t("coachFeature1")}</li>
                  <li>• {t("coachFeature2")}</li>
                  <li>• {t("coachFeature3")}</li>
                  <li>• {t("coachFeature4")}</li>
                </ul>
                <button
                  onClick={() => handleOpenUpgradeModal(SubscriptionRequestType.COACH)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {t("upgradeToCoachButton")}
                </button>
              </div>
            )}
          </section>
        )}

        {/* My Subscription Requests Section */}
        {!profile.roles.includes("admin") && (
          <section className="bg-white rounded-xl border border-brandBorder mt-6">
            <button
              onClick={toggleRequestsExpanded}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-brandSurface/50 transition rounded-xl"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-brandText">{t("myRequestsTitle")}</h2>
                {subscriptionRequests.filter((r) => r.status === SubscriptionRequestStatus.PENDING).length > 0 && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {subscriptionRequests.filter((r) => r.status === SubscriptionRequestStatus.PENDING).length} {t("pendingRequests")}
                  </span>
                )}
              </div>
              {requestsExpanded ? (
                <ChevronUp className="h-5 w-5 text-brandText/60" />
              ) : (
                <ChevronDown className="h-5 w-5 text-brandText/60" />
              )}
            </button>

            {requestsExpanded && (
              <div className="px-6 pb-6 space-y-4">
                {requestsLoading ? (
                  <div className="py-8 text-center text-brandText/60">
                    {t("loadingRequests")}
                  </div>
                ) : subscriptionRequests.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-brandText/60">{t("noRequestsYet")}</p>
                    <p className="text-sm text-brandText/50 mt-2">{t("noRequestsHint")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subscriptionRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border border-brandBorder rounded-lg p-4 hover:bg-brandSurface/30 transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Header: Type and Status */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <span
                                className={`px-3 py-1 text-sm font-medium rounded-full ${
                                  request.requestType === SubscriptionRequestType.PREMIUM
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {request.requestType === SubscriptionRequestType.PREMIUM
                                  ? t("requestTypePremium")
                                  : t("requestTypeCoach")}
                              </span>
                              {request.coachTier && (
                                <span className="text-sm text-brandText/70">
                                  {t("tierLabel")}: {request.coachTier}
                                </span>
                              )}
                              <div className="flex items-center gap-2">
                                {getRequestStatusIcon(request.status)}
                                <span
                                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getRequestStatusBadgeColor(
                                    request.status
                                  )}`}
                                >
                                  {t(`requestStatus${request.status}` as any)}
                                </span>
                              </div>
                            </div>

                            {/* Submission Date */}
                            <div className="text-sm text-brandText/60">
                              {t("submittedOn")}: {formatDate(request.createdAt)}
                            </div>

                            {/* Motivation (if exists) */}
                            {request.motivation && (
                              <div className="text-sm">
                                <span className="font-medium text-brandText">{t("motivation")}:</span>
                                <p className="text-brandText/80 mt-1 line-clamp-2">{request.motivation}</p>
                              </div>
                            )}

                            {/* Admin Decision (if reviewed) */}
                            {request.reviewedBy && request.reviewedAt && (
                              <div className="bg-brandSurface rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-brandText">
                                    {request.status === SubscriptionRequestStatus.APPROVED
                                      ? t("approvedBy")
                                      : t("rejectedBy")}
                                    :
                                  </span>
                                  <span className="text-sm text-brandText/70">
                                    {request.reviewedByUser?.displayName || t("adminUser")}
                                  </span>
                                  <span className="text-sm text-brandText/50">
                                    {t("on")} {formatDate(request.reviewedAt)}
                                  </span>
                                </div>
                                {request.adminNotes && (
                                  <div className="text-sm">
                                    <span className="font-medium text-brandText">{t("adminNotes")}:</span>
                                    <p className="text-brandText/80 mt-1">{request.adminNotes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          {request.status === SubscriptionRequestStatus.PENDING && (
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              disabled={cancellingRequestId === request.id}
                              className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {cancellingRequestId === request.id ? t("cancelling") : t("cancelRequest")}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Upgrade Request Modal */}
      {upgradeType && (
        <UpgradeRequestModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          requestType={upgradeType}
          onSuccess={handleUpgradeSuccess}
        />
      )}
    </div>
  );
}

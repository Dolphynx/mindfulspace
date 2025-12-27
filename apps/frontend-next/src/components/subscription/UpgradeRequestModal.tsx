'use client';

import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useTranslations } from '@/i18n/TranslationContext';
import {
  SubscriptionRequestType,
  CoachTier,
  createSubscriptionRequest,
} from '@/lib/api/subscription-requests';

interface UpgradeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: SubscriptionRequestType;
  onSuccess?: () => void;
}

type ModalStep = 'marketing' | 'form' | 'success';

export default function UpgradeRequestModal({
  isOpen,
  onClose,
  requestType,
  onSuccess,
}: UpgradeRequestModalProps) {
  const t = useTranslations('subscriptionRequests');
  const tPremium = useTranslations('premiumPage');
  const tCoach = useTranslations('formationPage');

  const [step, setStep] = useState<ModalStep>('marketing');
  const [selectedTier, setSelectedTier] = useState<CoachTier>(CoachTier.PROFESSIONAL);
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset state when closing
    setStep('marketing');
    setMotivation('');
    setExperience('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createSubscriptionRequest({
        requestType,
        ...(requestType === SubscriptionRequestType.COACH && { coachTier: selectedTier }),
        motivation: motivation || undefined,
        experience: experience || undefined,
      });

      setStep('success');
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('errorSubmitting'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPremium = requestType === SubscriptionRequestType.PREMIUM;

  // Render marketing content for step 1
  const renderMarketingContent = () => {
    if (isPremium) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <span className="text-3xl">⭐</span>
            </div>
            <h3 className="text-2xl font-bold text-brandText mb-2">{tPremium('heroTitle')}</h3>
            <p className="text-brandText/70">{tPremium('heroSubtitle')}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-semibold text-brandText mb-4">{tPremium('whyTitle')}</h4>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-brandText">{tPremium(`why${i}Title` as any)}</p>
                    <p className="text-xs text-brandText/70 mt-1">{tPremium(`why${i}Text` as any)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Programs */}
          <div>
            <h4 className="font-semibold text-brandText mb-3 text-center">{tPremium('programTitle')}</h4>
            <p className="text-sm text-brandText/70 mb-4 text-center">{tPremium('programSubtitle')}</p>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-full text-yellow-700 font-semibold text-sm flex-shrink-0">
                      {i}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-sm font-semibold text-brandText">{tPremium(`program${i}Title` as any)}</h5>
                      <p className="text-xs text-brandText/60 mt-1">{tPremium(`program${i}Duration` as any)}</p>
                      <ul className="mt-2 space-y-1">
                        {[1, 2, 3].map((j) => (
                          <li key={j} className="text-xs text-brandText/70 flex items-start gap-1">
                            <span className="text-yellow-600 mt-0.5">✓</span>
                            <span>{tPremium(`program${i}Item${j}` as any)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <span className="text-3xl">🧘</span>
            </div>
            <h3 className="text-2xl font-bold text-brandText mb-2">{tCoach('heroTitle')}</h3>
            <p className="text-brandText/70">{tCoach('heroSubtitle')}</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-semibold text-brandText mb-4">{tCoach('whyTitle')}</h4>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-brandText">{tCoach(`why${i}Title` as any)}</p>
                    <p className="text-xs text-brandText/70 mt-1">{tCoach(`why${i}Text` as any)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coach Training Program */}
          <div>
            <h4 className="font-semibold text-brandText mb-3 text-center">{tCoach('programTitle')}</h4>
            <p className="text-sm text-brandText/70 mb-4 text-center">{tCoach('programSubtitle')}</p>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-full text-purple-700 font-semibold text-sm flex-shrink-0">
                      {i}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-sm font-semibold text-brandText">{tCoach(`program${i}Title` as any)}</h5>
                      <p className="text-xs text-brandText/60 mt-1">{tCoach(`program${i}Duration` as any)}</p>
                      <ul className="mt-2 space-y-1">
                        {[1, 2, 3].map((j) => (
                          <li key={j} className="text-xs text-brandText/70 flex items-start gap-1">
                            <span className="text-purple-600 mt-0.5">✓</span>
                            <span>{tCoach(`program${i}Item${j}` as any)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Tiers */}
          <div>
            <h4 className="font-semibold text-brandText mb-4 text-center">{tCoach('pricingTitle')}</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  tier: CoachTier.STARTER,
                  title: tCoach('pricing1Title'),
                  price: tCoach('pricing1Price'),
                  features: [tCoach('pricing1F1'), tCoach('pricing1F2'), tCoach('pricing1F3')]
                },
                {
                  tier: CoachTier.PROFESSIONAL,
                  title: tCoach('pricing2Title'),
                  price: tCoach('pricing2Price'),
                  recommended: true,
                  features: [tCoach('pricing2F1'), tCoach('pricing2F2'), tCoach('pricing2F3')]
                },
                {
                  tier: CoachTier.PREMIUM,
                  title: tCoach('pricing3Title'),
                  price: tCoach('pricing3Price'),
                  features: [tCoach('pricing3F1'), tCoach('pricing3F2'), tCoach('pricing3F3')]
                },
              ].map(({ tier, title, price, recommended, features }) => (
                <div
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedTier === tier
                      ? 'border-purple-600 ring-2 ring-purple-600 bg-purple-50'
                      : 'border-brandBorder hover:border-purple-300'
                  }`}
                >
                  {recommended && (
                    <span className="text-xs bg-brandGreen text-white px-2 py-0.5 rounded-full block text-center mb-2">
                      {t('recommended')}
                    </span>
                  )}
                  <p className="font-semibold text-brandText text-sm text-center">{title}</p>
                  <p className="text-lg font-bold text-purple-600 text-center my-2">{price}</p>
                  <ul className="space-y-1">
                    {features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-brandText/70 flex items-start gap-1">
                        <span className="text-purple-600 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-brandBorder px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-brandText">
                {isPremium ? t('requestPremiumTitle') : t('requestCoachTitle')}
              </h2>
              {/* Step indicator */}
              {step !== 'success' && (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === 'marketing'
                        ? isPremium
                          ? 'bg-yellow-600 text-white'
                          : 'bg-purple-600 text-white'
                        : 'bg-brandGreen text-white'
                    }`}
                  >
                    {step === 'marketing' ? '1' : <Check className="h-4 w-4" />}
                  </div>
                  <div className={`w-12 h-0.5 ${step === 'form' ? 'bg-brandGreen' : 'bg-brandBorder'}`} />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === 'form'
                        ? isPremium
                          ? 'bg-yellow-600 text-white'
                          : 'bg-purple-600 text-white'
                        : 'bg-brandBorder text-brandText/50'
                    }`}
                  >
                    2
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-brandText/50 hover:text-brandText transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {step === 'success' ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-brandGreen mb-2">
                {t('successTitle')}
              </h3>
              <p className="text-brandText/70">{t('successMessage')}</p>
            </div>
          ) : step === 'marketing' ? (
            <>
              {renderMarketingContent()}
              <div className="flex justify-end pt-6 mt-6 border-t border-brandBorder">
                <button
                  onClick={() => setStep('form')}
                  className={`px-6 py-2 text-white rounded-lg transition flex items-center gap-2 ${
                    isPremium
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {t('continueToForm')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Introduction */}
              <div className="bg-brandGreen/10 border border-brandGreen/30 rounded-lg p-4">
                <p className="text-sm text-brandText">
                  {isPremium ? t('premiumFormIntro') : t('coachFormIntro')}
                </p>
              </div>

              {/* Coach Tier Selection */}
              {!isPremium && (
                <div>
                  <label className="block text-sm font-medium text-brandText mb-3">
                    {t('selectTierLabel')} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid gap-3">
                    {[
                      { tier: CoachTier.STARTER, name: tCoach('pricing1Title'), price: tCoach('pricing1Price') },
                      { tier: CoachTier.PROFESSIONAL, name: tCoach('pricing2Title'), price: tCoach('pricing2Price'), recommended: true },
                      { tier: CoachTier.PREMIUM, name: tCoach('pricing3Title'), price: tCoach('pricing3Price') },
                    ].map(({ tier, name, price, recommended }) => (
                      <div
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedTier === tier
                            ? 'border-purple-600 ring-2 ring-purple-600 bg-purple-50'
                            : 'border-brandBorder hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-brandText">{name}</p>
                            <p className="text-sm text-brandText/60">{price}</p>
                          </div>
                          {recommended && (
                            <span className="text-xs bg-brandGreen text-white px-2 py-1 rounded-full">
                              {t('recommended')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium text-brandText mb-2">
                  {t('motivationLabel')} {isPremium && <span className="text-brandText/60">({t('optional')})</span>}
                </label>
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                  placeholder={t('motivationPlaceholder')}
                />
                <p className="text-xs text-brandText/60 mt-1">
                  {motivation.length}/1000
                </p>
              </div>

              {/* Experience (Coach only) */}
              {!isPremium && (
                <div>
                  <label className="block text-sm font-medium text-brandText mb-2">
                    {t('experienceLabel')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    rows={6}
                    maxLength={2000}
                    required
                    className="w-full px-4 py-2 border border-brandBorder rounded-lg focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                    placeholder={t('experiencePlaceholder')}
                  />
                  <p className="text-xs text-brandText/60 mt-1">
                    {experience.length}/2000
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-between pt-4 border-t border-brandBorder">
                <button
                  type="button"
                  onClick={() => setStep('marketing')}
                  className="px-6 py-2 border border-brandBorder rounded-lg hover:bg-brandSurface transition flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('back')}
                </button>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2 border border-brandBorder rounded-lg hover:bg-brandSurface transition"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (!isPremium && !experience)}
                    className={`px-6 py-2 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      isPremium
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isSubmitting ? t('submitting') : t('submitRequest')}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


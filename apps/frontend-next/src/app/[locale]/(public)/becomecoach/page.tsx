/**
 * Page Formation – Devenir Coach Bien-Être
 * ----------------------------------------
 * Version adaptée pour i18n.
 *
 * Particularités i18n :
 * - Tous les textes utilisateur proviennent du dictionnaire `formationPage`.
 * - La locale est extraite via les paramètres dynamiques Next.js 15 (params asynchrone).
 * - La structure et les commentaires d’origine sont préservés.
 */

import PageHero from "@/components/PageHero";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export default async function FormationPage({
                                                params,
                                            }: {
    params: Promise<{ locale: string }>;
}) {
    // Récupération de la locale
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    // Chargement du dictionnaire
    const dict = await getDictionary(locale);
    const t = dict.formationPage;

    return (
        <div className="text-brandText flex flex-col">

            {/* HERO */}
            <PageHero
                title={t.heroTitle}
                subtitle={t.heroSubtitle}
            />

            {/* SECTION : Pourquoi devenir coach ? */}
            <section className="mx-auto max-w-6xl w-full px-4 py-8">
                <h2 className="text-3xl font-semibold text-center mb-10">
                    {t.whyTitle}
                </h2>

                <div className="grid md:grid-cols-4 gap-6">
                    <CardWhy
                        icon="👥"
                        title={t.why1Title}
                        text={t.why1Text}
                    />
                    <CardWhy
                        icon="📈"
                        title={t.why2Title}
                        text={t.why2Text}
                    />
                    <CardWhy
                        icon="💚"
                        title={t.why3Title}
                        text={t.why3Text}
                    />
                    <CardWhy
                        icon="🏅"
                        title={t.why4Title}
                        text={t.why4Text}
                    />
                </div>
            </section>

            {/* SECTION : Programme complet */}
            <section className="bg-white/50 py-8 px-4">
                <div className="mx-auto max-w-6xl">
                    <h2 className="text-3xl font-semibold text-center mb-6">
                        {t.programTitle}
                    </h2>
                    <p className="text-center text-brandText-soft mb-12">
                        {t.programSubtitle}
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <CardProgram
                            number="1"
                            title={t.program1Title}
                            duration={t.program1Duration}
                            items={[
                                t.program1Item1,
                                t.program1Item2,
                                t.program1Item3,
                            ]}
                        />
                        <CardProgram
                            number="2"
                            title={t.program2Title}
                            duration={t.program2Duration}
                            items={[
                                t.program2Item1,
                                t.program2Item2,
                                t.program2Item3,
                            ]}
                        />
                        <CardProgram
                            number="3"
                            title={t.program3Title}
                            duration={t.program3Duration}
                            items={[
                                t.program3Item1,
                                t.program3Item2,
                                t.program3Item3,
                            ]}
                        />
                        <CardProgram
                            number="4"
                            title={t.program4Title}
                            duration={t.program4Duration}
                            items={[
                                t.program4Item1,
                                t.program4Item2,
                                t.program4Item3,
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* SECTION : Tarification */}
            <section className="mx-auto max-w-6xl w-full px-4 py-8">
                <h2 className="text-3xl font-semibold text-center mb-10">
                    {t.pricingTitle}
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    <PricingCard
                        title={t.pricing1Title}
                        price={t.pricing1Price}
                        features={[
                            t.pricing1F1,
                            t.pricing1F2,
                            t.pricing1F3,
                            t.pricing1F4,
                            t.pricing1F5,
                        ]}
                        button={t.pricingButton}
                    />

                    <PricingCard
                        highlight
                        title={t.pricing2Title}
                        price={t.pricing2Price}
                        features={[
                            t.pricing2F1,
                            t.pricing2F2,
                            t.pricing2F3,
                            t.pricing2F4,
                            t.pricing2F5,
                            t.pricing2F6,
                        ]}
                        button={t.pricingButton}
                    />

                    <PricingCard
                        title={t.pricing3Title}
                        price={t.pricing3Price}
                        features={[
                            t.pricing3F1,
                            t.pricing3F2,
                            t.pricing3F3,
                            t.pricing3F4,
                            t.pricing3F5,
                            t.pricing3F6,
                        ]}
                        button={t.pricingButton}
                    />
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="bg-brandGreen-light py-16 px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-semibold mb-4">
                        {t.ctaTitle}
                    </h2>
                    <p className="text-brandText-soft mb-8">
                        {t.ctaSubtitle}
                    </p>

                    <div className="flex justify-center gap-4">
                        <button className="bg-brandGreen text-white px-6 py-3 rounded-lg font-medium shadow hover:opacity-90 transition">
                            🎓 {t.ctaButtonPrimary}
                        </button>
                        <button className="border border-brandBorder px-6 py-3 rounded-lg font-medium hover:bg-white/60 transition">
                            {t.ctaButtonSecondary}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* --- Composants internes inchangés (texte fourni via props i18n) --- */

type CardWhyProps = { icon: string; title: string; text: string };
function CardWhy({ icon, title, text }: CardWhyProps) {
    return (
        <div className="bg-white border border-brandBorder rounded-card shadow-card p-6 text-center">
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-brandText-soft">{text}</p>
        </div>
    );
}

type CardProgramProps = {
    number: string;
    title: string;
    duration: string;
    items: string[];
};
function CardProgram({ number, title, duration, items }: CardProgramProps) {
    return (
        <div className="bg-white border border-brandBorder rounded-card shadow-card p-6">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-brandGreen-light rounded-full text-brandGreen font-semibold">
                    {number}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-brandText-soft text-sm mb-4">{duration}</p>
                    <ul className="space-y-2 text-sm">
                        {items.map((i, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                                <span className="text-brandGreen">✔</span>
                                {i}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

type PricingCardProps = {
    title: string;
    price: string;
    features: string[];
    button: string;
    highlight?: boolean;
};
function PricingCard({ title, price, features, button, highlight }: PricingCardProps) {
    return (
        <div
            className={
                "border rounded-card shadow-card p-6 bg-white" +
                (highlight ? " border-brandGreen" : " border-brandBorder")
            }
        >
            {highlight && (
                <p className="text-center text-sm text-brandGreen font-semibold mb-2">
                    Recommandé
                </p>
            )}
            <h3 className="text-xl font-semibold mb-1">{title}</h3>
            <p className="text-3xl font-bold mb-4">{price}</p>
            <ul className="space-y-2 text-sm mb-6">
                {features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                        <span className="text-brandGreen">✔</span>
                        {f}
                    </li>
                ))}
            </ul>
            <button className="w-full border border-brandBorder py-2 rounded-lg font-medium hover:bg-white/60 transition">
                {button}
            </button>
        </div>
    );
}

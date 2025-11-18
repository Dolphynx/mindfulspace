/**
 * Page Formation – Devenir Coach Bien-Être
 * ----------------------------------------
 * Page statique inspirée de la landing page fournie en captures.
 *
 * Structure :
 * - Hero d’introduction
 * - Sections “Pourquoi devenir coach ?”
 * - Programme structuré (12 semaines)
 * - Tarification (3 formules)
 * - Appel à l’action final
 */

import PageHero from "@/components/PageHero";

export default function FormationPage() {
    return (
        <div className="text-brandText flex flex-col">

            {/* HERO */}
            <PageHero
                title="Devenir Coach Bien-Être"
                subtitle="Transformez des vies — et la vôtre — grâce à notre programme certifié MindfulSpace."
            />

            {/* SECTION : Pourquoi devenir coach ? */}
            <section className="mx-auto max-w-6xl w-full px-4 py-8">
                <h2 className="text-3xl font-semibold text-center mb-10">
                    Pourquoi devenir coach ?
                </h2>

                <div className="grid md:grid-cols-4 gap-6">
                    <CardWhy
                        icon="👥"
                        title="Construire une communauté"
                        text="Accompagner des personnes en quête de bien-être et créer un espace de soutien positif."
                    />
                    <CardWhy
                        icon="📈"
                        title="Développer sa pratique"
                        text="Élargir son impact et proposer un accompagnement structuré grâce à nos outils."
                    />
                    <CardWhy
                        icon="💚"
                        title="Faire une différence"
                        text="Aider les autres à atteindre leurs objectifs de santé mentale et d’équilibre."
                    />
                    <CardWhy
                        icon="🏅"
                        title="Gagner en reconnaissance"
                        text="Obtenir une certification et renforcer sa crédibilité professionnelle."
                    />
                </div>
            </section>

            {/* SECTION : Programme complet */}
            <section className="bg-white/50 py-8 px-4">
                <div className="mx-auto max-w-6xl">
                    <h2 className="text-3xl font-semibold text-center mb-6">
                        Programme de formation complet
                    </h2>
                    <p className="text-center text-brandText-soft mb-12">
                        Une formation structurée sur 12 semaines, conçue avec des experts du bien-être.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <CardProgram
                            number="1"
                            title="Fondations du coaching bien-être"
                            duration="4 semaines"
                            items={[
                                "Principes du coaching",
                                "Compétences en communication",
                                "Techniques de définition d’objectifs",
                            ]}
                        />
                        <CardProgram
                            number="2"
                            title="Nutrition & Hygiène de vie"
                            duration="3 semaines"
                            items={[
                                "Bases de la nutrition",
                                "Interventions liées au mode de vie",
                                "Construction d’habitudes durables",
                            ]}
                        />
                        <CardProgram
                            number="3"
                            title="Santé mentale & Pleine conscience"
                            duration="3 semaines"
                            items={[
                                "Gestion du stress",
                                "Techniques de méditation",
                                "Intelligence émotionnelle",
                            ]}
                        />
                        <CardProgram
                            number="4"
                            title="Gestion de la pratique professionnelle"
                            duration="2 semaines"
                            items={[
                                "Gestion des clients",
                                "Bases du business",
                                "Éthique & limites professionnelles",
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* SECTION : Tarification */}
            <section className="mx-auto max-w-6xl w-full px-4 py-8">
                <h2 className="text-3xl font-semibold text-center mb-10">
                    Choisissez votre parcours
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    <PricingCard
                        title="Fondation"
                        price="499€"
                        features={[
                            "Programme complet",
                            "Apprentissage autonome",
                            "Certification digitale",
                            "Accès à la bibliothèque de resources",
                            "Accès au forum de la communauté",
                        ]}
                        button="Commencer"
                    />

                    <PricingCard
                        highlight
                        title="Professionnel"
                        price="899€"
                        features={[
                            "Tout ce qui est inclus dans Foundation",
                            "Sessions de coaching en direct",
                            "Programme de mentorat",
                            "Certifications avancées",
                            "Boîte à outils marketing",
                            "Support prioritaire",
                        ]}
                        button="Commencer"
                    />

                    <PricingCard
                        title="Élite"
                        price="1499€"
                        features={[
                            "Tout ce qui est inclus dans Professionnel",
                            "Mentorat individuel",
                            "Coaching en développement professionnel",
                            "Profil coach mis en avant",
                            "Accès plateforme à vie",
                            "Crédits de formation continue",
                        ]}
                        button="Commencer"
                    />
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="bg-brandGreen-light py-16 px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-semibold mb-4">
                        Prêt à commencer votre parcours ?
                    </h2>
                    <p className="text-brandText-soft mb-8">
                        Rejoignez les coachs certifiés MindfulSpace et faites une réelle
                        différence dans la vie des autres.
                    </p>

                    <div className="flex justify-center gap-4">
                        <button className="bg-brandGreen text-white px-6 py-3 rounded-lg font-medium shadow hover:opacity-90 transition">
                            🎓 S’inscrire maintenant
                        </button>
                        <button className="border border-brandBorder px-6 py-3 rounded-lg font-medium hover:bg-white/60 transition">
                            En savoir plus
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* --- Composants internes (petits) --- */

type CardWhyProps = {
    icon: string;
    title: string;
    text: string;
};

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
                        {items.map((i: string, idx: number) => (
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
                {features.map((f: string, idx: number) => (
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

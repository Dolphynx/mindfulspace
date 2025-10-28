import Image from "next/image";

export default function ContactPage() {
    return (
        <div className="text-brandText flex flex-col">
            {/* HERO */}
            <section className="w-full border-b border-brandBorder bg-white">
                <div className="relative w-full h-[220px] overflow-hidden">
                    <Image
                        src="/images/wellness-hero3.jpg"
                        alt="Calm lake at sunrise"
                        width={1600}
                        height={600}
                        className="w-full h-full object-cover object-center"
                        priority
                    />
                    {/* Dégradé légèrement assombri pour lisibilité */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10 pointer-events-none" />

                    {/* Texte du hero en blanc */}
                    <div className="absolute inset-0 flex flex-col justify-center px-4 mx-auto max-w-7xl">
                        <h1 className="text-2xl font-semibold text-white">
                            Contact
                        </h1>
                        <p className="text-white text-sm mt-1">
                            Une question concernant MindfulSpace ?
                        </p>
                    </div>
                </div>
            </section>

            {/* CONTENU CONTACT */}
            <section className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h2 className="text-xl font-semibold text-brandText mb-2">
                        Équipe MindfulSpace
                    </h2>
                    <p className="text-brandText-soft text-sm leading-relaxed">
                        MindfulSpace est un projet académique fictif développé
                        dans le cadre d&apos;un cursus en développement
                        d&apos;application.
                        <strong className="block text-brandText mt-2">
                            Aucune information fournie via cette plateforme
                            n&apos;est lue, traitée ni suivie par un
                            professionnel de santé.
                        </strong>
                    </p>

                    <div className="mt-4 text-sm text-brandText-soft space-y-2">
                        <p>
                            📧 Email :{" "}
                            <span className="font-medium text-brandText">
                                contact@mindfulspace.be
                            </span>
                        </p>
                        <p>🏢 Adresse : Rue de Harlez 18, 4000 Liège</p>
                        <p>📞 Téléphone : +32 499 12 34 56</p>
                    </div>
                </article>

                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h3 className="text-lg font-semibold text-brandText mb-2">
                        Besoin d&apos;aide urgente ?
                    </h3>
                    <p className="text-sm text-brandText-soft leading-relaxed">
                        Cette application n&apos;est pas un service médical. En
                        cas de détresse émotionnelle ou de crise, contacte
                        immédiatement un service d&apos;urgence ou une ligne
                        d&apos;écoute professionnelle.
                    </p>
                    <p className="text-xl mt-4" aria-hidden="true">
                        😄
                    </p>
                </article>
            </section>
        </div>
    );
}

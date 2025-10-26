import Image from "next/image";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-start min-h-screen text-center bg-gradient-to-b from-emerald-50 via-white to-rose-50">
            {/* BANNIÈRE */}
            <div className="relative w-full h-[300px] overflow-hidden">
                <Image
                    src="/hill-5324149_1280.jpg"
                    alt="Paysage apaisant MindfulSpace"
                    fill
                    priority
                    className="object-contain object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-900 drop-shadow-sm">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                        MindfulSpace
                    </h1>
                    <p className="text-base sm:text-lg font-medium text-emerald-800">
                        Respirez, votre espace de sérénité est en ligne 🌿
                    </p>
                </div>
            </div>

            {/* SECTION CONTENU */}
            <section className="max-w-3xl w-full -mt-20 sm:-mt-28 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_60px_-10px_rgba(0,0,0,0.2)] p-8 sm:p-12 border border-emerald-100/60">
                <p className="text-lg sm:text-xl text-slate-700 leading-relaxed mb-8">
                    Cette page a été{" "}
                    <span className="text-emerald-600 font-semibold">
            déployée automatiquement [EN STAGING]
          </span>{" "}
                    grâce à notre pipeline{" "}
                    <span className="text-sky-600 font-semibold">
            CI/CD GitLab
          </span>{" "}
                    🚀
                    <br />
                    Prenez une grande inspiration,{" "}
                    <span className="italic text-slate-600">
            le déploiement est zen.
          </span>
                </p>

                {/* MODULE RESPIRATION */}
                <div className="w-full rounded-2xl bg-emerald-50/70 border border-emerald-100 text-left p-5 shadow-inner">
                    <p className="text-sm font-medium text-emerald-800 tracking-wide uppercase">
                        Pause respiration (10s)
                    </p>
                    <p className="text-slate-700 text-base leading-relaxed mt-2">
                        Inspire 4 secondes…<br />
                        Garde l’air 2 secondes…<br />
                        Expire doucement 4 secondes…<br />
                        Tu es exactement où tu dois être 🌿
                    </p>
                </div>

                {/* BOUTONS */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="https://git.helmo.be/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md transition-all hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-emerald-300"
                    >
                        Voir le pipeline
                    </a>

                    <a
                        href="https://nextjs.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full border border-emerald-300/80 text-emerald-700 hover:bg-emerald-100/60 font-semibold shadow-sm transition-all hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-emerald-200"
                    >
                        Powered by Next.js ⚡
                    </a>
                </div>

                {/* FOOTER */}
                <footer className="mt-8 text-sm text-slate-500">
                    <p>
                        Made with ❤️ et sérénité par{" "}
                        <span className="text-emerald-600 font-medium">
              l’équipe MindfulSpace
            </span>
                    </p>
                </footer>
            </section>

            {/* NOTE BAS DE PAGE */}
            <p className="mt-10 mb-6 text-xs text-slate-400">
                prod = calme • staging = expérimental • respire avant de push 🙏
            </p>
        </main>
    );
}

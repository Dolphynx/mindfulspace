import Image from "next/image";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center">
            <section className="w-full max-w-3xl flex flex-col items-center gap-10 rounded-3xl bg-white/70 backdrop-blur-xl shadow-[0_30px_120px_-20px_rgba(0,0,0,0.3)] p-8 sm:p-12 border border-white/60">
                {/* Illustration / header visuel */}
                <div className="flex flex-col items-center gap-4">
                    <div className="rounded-2xl bg-gradient-to-tr from-emerald-50 via-white to-rose-50 p-6 shadow-inner ring-1 ring-emerald-100/60 min-w-[220px]">
                        <Image
                            src="/dev_team.svg" // laisse tel quel tant qu’on n'a pas mieux
                            alt="MindfulSpace illustration"
                            width={260}
                            height={260}
                            priority
                            className="mx-auto drop-shadow-xl"
                        />
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-emerald-700">
                        👋 Salut la Team
                        <br className="sm:hidden" />{" "}
                        <span className="text-emerald-600 font-bold">
              MindfulSpace&nbsp;!
            </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-700 leading-relaxed max-w-prose">
                        Cette page a été{" "}
                        <span className="text-emerald-600 font-semibold">
              déployée automatiquement
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
                </div>

                {/* Petit module respiration */}
                <div className="w-full max-w-sm rounded-2xl bg-emerald-50/70 border border-emerald-100 text-left p-5 shadow-inner">
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

                {/* Boutons */}
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
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

                {/* Footer */}
                <footer className="mt-8 text-sm text-slate-500">
                    <p>
                        Made with ❤️ et sérénité par{" "}
                        <span className="text-emerald-600 font-medium">
              l’équipe MindfulSpace
            </span>
                    </p>
                </footer>
            </section>

            {/* mini note bas de page */}
            <p className="mt-10 text-xs text-slate-400">
                prod = calme • staging = expérimental • respire avant de push 🙏
            </p>
        </main>
    );
}

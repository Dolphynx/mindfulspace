import Image from "next/image";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center">
            <div className="max-w-2xl flex flex-col items-center gap-10 animate-fade-in">
                <Image
                    src="/dev_team.svg"
                    alt="Illustration MindfulSpace"
                    width={320}
                    height={320}
                    priority
                    className="drop-shadow-xl rounded-2xl bg-gradient-to-tr from-emerald-100 to-sky-100 p-6"
                />

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-emerald-700">
                    👋 Salut la Team MindfulSpace !
                </h1>

                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                    Cette page a été{" "}
                    <span className="text-emerald-600 font-semibold">
            déployée automatiquement
          </span>{" "}
                    grâce à notre pipeline{" "}
                    <span className="text-sky-600 font-semibold">CI/CD GitLab</span> 🚀
                    <br />
                    Prenez une grande inspiration,{" "}
                    <span className="italic text-gray-600">le déploiement est zen.</span>
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <a
                        href="https://git.helmo.be/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md transition-all hover:scale-105"
                    >
                        Voir le pipeline
                    </a>

                    <a
                        href="https://nextjs.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full border border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-semibold shadow-sm transition-all hover:scale-105"
                    >
                        Powered by Next.js ⚡
                    </a>
                </div>

                <footer className="mt-12 text-sm text-gray-500">
                    <p>
                        Made with ❤️ et sérénité par{" "}
                        <span className="text-emerald-600 font-medium">
              l’équipe MindfulSpace
            </span>
                    </p>
                </footer>
            </div>
        </main>
    );
}

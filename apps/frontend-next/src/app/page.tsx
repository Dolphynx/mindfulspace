import Image from "next/image";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-6 py-12 text-center">
            <div className="max-w-2xl flex flex-col items-center gap-8">
                <Image
                    src="/dev_team.svg"
                    alt="Illustration développeur MindfulSpace"
                    width={300}
                    height={300}
                    priority
                    className="drop-shadow-lg animate-fade-in"
                />

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                    👋 Salut la Team MindfulSpace !
                </h1>

                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                    J’ai été <span className="text-green-400 font-semibold">déployé automatiquement</span>
                    grâce à notre pipeline <span className="text-blue-400 font-semibold">CI/CD GitLab</span> 🎉
                    <br />
                    Vous pouvez maintenant respirer, coder, et savourer ce moment 😎
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <a
                        href="https://git.helmo.be/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-black font-semibold transition-colors"
                    >
                        Voir le pipeline
                    </a>

                    <a
                        href="https://nextjs.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full border border-white/30 hover:bg-white/10 font-semibold transition-colors"
                    >
                        Powered by Next.js ⚡
                    </a>
                </div>

                <footer className="mt-10 text-sm text-gray-500">
                    <p>Made with ❤️ par l’équipe MindfulSpace</p>
                </footer>
            </div>
        </main>
    );
}

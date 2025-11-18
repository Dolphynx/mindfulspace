'use client';

export default function Page() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brandBg-light/70 to-brandBg p-6 text-center">
            {/* Icône / Illustration */}
            <div className="text-7xl mb-6 animate-pulse-slow">
                🧘‍♀️
            </div>

            {/* Titre */}
            <h1 className="text-4xl font-extrabold text-brandText mb-3">
                Espace en construction 🛠️
            </h1>

            {/* Sous-texte */}
            <p className="text-lg text-brandText-soft max-w-xl">
                Nous préparons un espace plus calme, plus harmonieux et plus utile pour votre bien-être.
                Revenez bientôt… 🌿
            </p>

            {/* Petit style anim */}
            <style jsx>{`
        .animate-pulse-slow {
          animation: pulse 6.8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
        </div>
    );
}

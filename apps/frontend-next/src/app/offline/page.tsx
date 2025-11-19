export default function OfflinePage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="max-w-md text-center space-y-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Vous êtes hors connexion
                </h1>
                <p className="text-gray-600">
                    MindfulSpace n’arrive pas à joindre le serveur.
                    Certaines fonctionnalités ne sont pas disponibles hors-ligne.
                </p>
                <ul className="text-left text-gray-600 list-disc list-inside space-y-1 text-sm">
                    <li>Vérifiez votre connexion internet</li>
                    <li>Réessayez de recharger la page dans quelques instants</li>
                    <li>Les pages déjà visitées peuvent rester accessibles</li>
                </ul>
            </div>
        </main>
    );
}

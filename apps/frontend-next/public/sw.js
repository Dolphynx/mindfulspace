// ------------------------------------------------------------
// public/sw.js
// Service Worker minimal pour MindfulSpace
// ------------------------------------------------------------

// Nom du cache utilisé. Quand tu changes ce nom (ex: v2 → v3),
// le navigateur considère que c'est une "nouvelle version" du SW.
const CACHE_NAME = "mindfulspace-v1";

// Liste des ressources que l’on veut ABSOLUMENT rendre disponibles hors-ligne.
// C’est le “shell minimal” de l’application.
const URLS_TO_CACHE = [
    "/",                    // La page d’accueil
    "/manifest.json",       // Le manifest PWA
    "/images/favicon.ico",  // Le favicon
    "/offline"              // page offline
];

// ------------------------------------------------------------
// PHASE 1 — INSTALLATION
// ------------------------------------------------------------
//
// Le SW s’installe lorsque le navigateur télécharge pour la première fois
// ce fichier `sw.js`.
//
// Pendant l’installation, on pré-charge certaines ressources dans le cache.
// ------------------------------------------------------------
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // addAll télécharge et stocke *tout* le tableau URLS_TO_CACHE.
            return cache.addAll(URLS_TO_CACHE);
        })
    );

    // skipWaiting : active immédiatement cette version du SW
    // même si l’ancienne version existe encore.
    // (Sinon, le nouveau SW reste "en attente" jusqu'à la fermeture des onglets.)
    self.skipWaiting();
});

// ------------------------------------------------------------
// PHASE 2 — ACTIVATION
// ------------------------------------------------------------
//
// Ici, le SW devient vraiment actif et prend le contrôle des pages.
// On en profite pour nettoyer les vieux caches s’il y en a.
// ------------------------------------------------------------
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    // On supprime tous les caches dont le nom ne correspond PAS
                    // à CACHE_NAME (donc ancien cache = supprimé)
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );

    // clients.claim : force les pages ouvertes à utiliser immédiatement
    // ce SW, sans attendre un rechargement.
    self.clients.claim();
});

// ------------------------------------------------------------
// PHASE 3 — INTERCEPTION DES REQUÊTES ("fetch")
// ------------------------------------------------------------
//
// À partir de maintenant, toutes les requêtes GET passent par le SW.
// On applique ici une stratégie "network first" :
//
// 1. On essaie d’abord de récupérer la ressource depuis INTERNET.
// 2. Si ça marche → on renvoie la réponse ET on la met en cache.
// 3. Si ça échoue → on cherche la ressource dans le cache.
// 4. Si c’est une page HTML (navigation), on renvoie "/" par défaut.
// ------------------------------------------------------------
self.addEventListener("fetch", (event) => {
    const request = event.request;

    // On ignore les requêtes non-GET (POST, PUT, etc.)
    // et certaines URLs internes du navigateur.
    if (request.method !== "GET" || request.url.startsWith("chrome-extension")) {
        return;
    }

    event.respondWith(
        // 1. On tente d'abord d'aller sur Internet
        fetch(request)
            .then((response) => {
                // La réponse doit être clonée avant d'être mise en cache,
                // car une réponse ne peut être lue qu'une seule fois.
                const responseClone = response.clone();

                // 2. On stocke la version réseau dans le cache pour la prochaine fois.
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseClone);
                });

                // On renvoie ce que la requête réseau a retourné.
                return response;
            })

            // 3 & 4. Si le réseau échoue → fallback vers le cache
            .catch(async () => {
                // On cherche dans le cache une version existante de la ressource
                const cached = await caches.match(request);
                if (cached) return cached;

                // Si la requête est une navigation (HTML),
                // et que même là le cache n’a rien, on renvoie "/offline" par défaut.
                // Cela permet à l'app de rester "navigable" hors-ligne.
                if (request.mode === "navigate") {
                    return caches.match("/offline");
                }

                // Sinon → undefined (la requête échoue mais silencieusement)
                return undefined;
            })
    );
});

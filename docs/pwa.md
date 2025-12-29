***

# Guide PWA – Frontend MindfulSpace

> Ce document explique ce qui a été mis en place pour transformer le frontend Next.js en PWA : manifest, service worker, enregistrement côté client et quelques implications techniques.

***

## 1. Ce qui a été mis en place

### 1.1. Manifest Web App

- Le manifest `public/manifest.json` déclare le nom de l’app, le mode d’affichage et les icônes nécessaires pour l’installation en “pseudo-native” (écran d’accueil, etc.).
- Les propriétés principales sont `name`, `short_name`, `start_url`, `display: "standalone"`, `background_color`, `theme_color` et une liste d’icônes PNG en 192, 512 et 1024px.

> Le champ display: "standalone" indique au navigateur que l’app doit se comporter comme une application “installée” : elle s’ouvre dans sa propre fenêtre, sans barre d’URL ni chrome du navigateur classique, un peu comme une app native.​

### 1.2. Service worker custom

- Un service worker custom est défini dans `public/sw.js`, avec un nom de cache `mindfulspace-v1` et une liste d’URLs pré‑cachées (`/`, `/manifest.json`, favicon, `/offline`).
- Le service worker implémente les 3 phases classiques : `install` (pré‑cache), `activate` (nettoyage des anciens caches) et `fetch` (interception des requêtes).

> Au départ, la PWA avait été prototypée avec le plugin next-pwa, mais cette approche s’est révélée incompatible avec Turbopack. 
Le projet utilise donc un service worker custom (public/sw.js) : le code est court, maîtrisé, facile à adapter, et ne dépend pas d’un plugin tiers ni d’intégration particulière avec le pipeline Next/Turbopack.

### 1.3. Enregistrement côté client

- L’enregistrement du service worker est encapsulé dans `registerServiceWorker()` (fichier `register-sw.tsx`), appelé uniquement en environnement non‑dev (`NODE_ENV !== "development"`).
- Un composant React `ServiceWorkerRegister` (client component) appelle cette fonction via `useEffect` au montage, sans rendre d’UI.

> Le SW n'est pas enregistré en mode développement. Cela évite une source classique de bugs en dev : un service worker mis en cache qui continue d’intercepter les requêtes même après un changement de code, ce qui peut donner l’impression que le frontend “ne se met pas à jour” ou que les assets sont “bloqués”.

***

## 2. Comment ça marche techniquement

### 2.1. Manifest + Next

- Next expose statiquement `public/manifest.json`, qui est ensuite référencé dans le `<head>` (link rel="manifest") via le layout global (voir `layout.tsx`).[6]
- Ce manifest indique au navigateur comment “installer” l’app, quelles icônes utiliser et quelle colorimétrie appliquer à la barre système en mode standalone.

### 2.2. Cycle de vie du service worker

- À l’`install`, le SW ouvre le cache `mindfulspace-v1` et y ajoute toutes les URLs critiques définies dans `URLS_TO_CACHE` (shell minimal de l’app).
- À l’`activate`, il supprime tous les caches dont le nom ne correspond pas à `CACHE_NAME`, puis appelle `clients.claim()` pour prendre immédiatement le contrôle des onglets ouverts.

### 2.3. Stratégie de cache (“network first”)

- Sur chaque requête `fetch`, le SW ignore les requêtes non‑GET et celles liées à des extensions (`chrome-extension://`).
- Pour les autres, il applique une stratégie “network first” : tentative réseau → mise en cache de la réponse → fallback vers le cache en cas d’erreur, avec une route spéciale pour les navigations HTML.

***

## 3. Intégration côté Next / React

### 3.1. Enregistrement conditionnel

- `registerServiceWorker()` vérifie que l’environnement est bien `production` et que `serviceWorker` est supporté dans `navigator` avant d’appeler `navigator.serviceWorker.register('/sw.js')`.
- En cas de succès, le scope du service worker est loggé en console, et en cas d’erreur, un message d’erreur est affiché pour faciliter le debug.

### 3.2. Composant d’enregistrement

- `ServiceWorkerRegister` est un composant client minimal : il importe `registerServiceWorker`, l’appelle dans un `useEffect` sans dépendances, et ne rend rien (`return null`).
- Ce composant peut être monté dans le layout racine ou dans un layout spécifique pour garantir que le service worker est enregistré dès le chargement de l’app.[6]

### 3.3. Configuration Next et modes de build

- `next.config.ts` est configuré pour produire un `output: "export"` lorsque `NEXT_OUTPUT === "export"` (cas Capacitor), et `output: "standalone"` sur Linux pour les builds Docker/prod.
- Le branchement PWA n’utilise plus `next-pwa` pour l’instant (config commentée) : le projet s’appuie sur un SW custom + `export` pour cibler Capacitor.

***

## 4. Ce qu’il faut savoir pour faire évoluer la PWA

### 4.1. Ajouter/mettre à jour des assets PWA

- Pour modifier le nom de l’app, les couleurs ou les icônes, il suffit d’éditer `public/manifest.json` et d’ajouter les fichiers d’icônes correspondants dans `public/images`.
- En cas de changement de manifest, il peut être nécessaire de vider le cache ou de forcer la réinstallation sur certains navigateurs (comportement lié au cache HTTP et au SW).

### 4.2. Faire évoluer la logique de cache

- Pour invalider une ancienne version du service worker côté clients, la pratique est de changer `CACHE_NAME` (ex. `mindfulspace-v2`) et éventuellement la liste `URLS_TO_CACHE`.
- Toute nouvelle route que l’on veut rendre dispo **offline par défaut** doit être ajoutée dans `URLS_TO_CACHE` et servie correctement dans la logique `fetch` (fallback si réseau KO).

### 4.3. Distinction PWA vs offline/sync

- Le service worker actuel se concentre principalement sur le cache des assets statiques et d’une page `/offline` ; la logique de sync IndexedDB / API est gérée ailleurs (fichiers `db.ts`, `sync.ts`, etc.) et n’est pas encore complètement fiabilisée.
- Un document séparé détaillera la partie offline/sync (IndexedDB via `idb`, queues de sessions, resync quand le réseau revient) pour éviter de surcharger ce guide PWA

***

## 5. Bonnes pratiques & limites actuelles

### 5.1. Bonnes pratiques PWA dans ce projet

- Garder `registerServiceWorker()` minimal et idempotent, et le laisser gérer la détection d’environnement pour éviter des surprises en dev.
- Changer `CACHE_NAME` à chaque évolution non triviale du shell (pages, routes critiques, assets) pour forcer le renouvellement du cache côté utilisateurs.

### 5.2. Limites et points d’attention

- La stratégie actuelle “network first” convient bien pour des données qui doivent rester fraîches, mais peut provoquer des sensations de latence en cas de réseau faible ; une stratégie hybride ou par‑route pourra être envisagée plus tard.
- La partie “offline complet” (sauvegarde locale des sessions + synchronisation fiable dès que le réseau revient) est encore en cours de stabilisation et sera décrite précisément dans le document dédié OFFLINE/SYNC.
***
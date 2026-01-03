# Guide Offline & Sync – Frontend MindfulSpace

> Ce document décrit la logique offline du frontend : stockage local dans IndexedDB, file d’attente des actions utilisateur et synchronisation vers l’API lorsque le réseau revient.

> ⚠️ La logique offline/sync est **partiellement implémentée** et pourra évoluer (types supplémentaires, gestion d’erreurs plus fine, retries, etc.).

***

## 1. Ce qui a été mis en place

### 1.1. Base IndexedDB (via `idb`)

- Le stockage offline utilise IndexedDB via la librairie `idb`, dans une base `mindfulspace-offline` versionnée (actuellement `DB_VERSION = 7`).
- Deux stores principaux sont créés : `offlineQueue` (file d’actions à synchroniser) et `sleepHistory` (historique local du sommeil, indexé par `date`).

### 1.2. File d’attente des actions (`offlineQueue`)

- `offlineQueue` stocke des objets `OfflineQueueItem` : `type` (`"sleep" | "exercise" | "meditation"`), `payload` libre, `createdAt`, et un `id` auto‑incrémenté. 
- Lorsqu’une action ne peut pas être envoyée (par ex. utilisateur offline), elle est ajoutée à cette queue pour être rejouée plus tard.

### 1.3. Historique de sommeil offline (`sleepHistory`)

- Le store `sleepHistory` sauvegarde des résumés journaliers `OfflineSleepHistoryItem` (date `YYYY-MM-DD` unique, heures de sommeil, qualité).
- Cela permet d’afficher un historique même sans connexion, en s’appuyant sur les données déjà synchronisées ou saisies offline.

***

## 2. Comment ça marche techniquement

### 2.1. Ouverture et migration de la base

- `getDB()` ouvre la base via `openDB(DB_NAME, DB_VERSION, { upgrade })`, et jette une erreur si appelé côté serveur (pas d’IndexedDB en Server Components).
- Dans la phase `upgrade`, la fonction crée les object stores manquants (`offlineQueue` avec `keyPath: "id", autoIncrement: true`, et `sleepHistory` avec `keyPath: "date"`), ce qui centralise l’évolution du schéma.

### 2.2. Enregistrement des actions dans la queue

- `sessionQueue.ts` expose des helpers pour ajouter et lire les entrées de `offlineQueue` (par exemple `queueAction`, `getQueuedActions`, `removeQueuedAction`).
- Le pattern d’usage est : au moment de créer une session (p. ex. sommeil), si l’API échoue parce que l’utilisateur est offline, on pousse un item `{ type: "sleep", payload: { ... } }` dans la queue.

### 2.3. Sauvegarde et lecture de l’historique de sommeil

- `sleepHistory.ts` fournit `saveSleepHistory`, `getSleepHistory(lastDays)` et `upsertSleepHistoryItem`, tous basés sur `getDB()` et le store `sleepHistory`.
- `saveSleepHistory` écrit un tableau de sessions sous forme d’items normalisés, `getSleepHistory` filtre les entrées par date (fenêtre `lastDays`) et les renvoie dans un format adapté à l’UI.

***

## 3. Mécanisme de synchronisation

### 3.1. Fonction centrale `syncOfflineQueue`

- `syncOfflineQueue()` lit tous les items de `offlineQueue` via `getQueuedActions()` et ne fait rien si `navigator.onLine` est `false`.
- Pour chaque item, un `switch` applique la logique métier : actuellement seul `type: "sleep"` est réellement implémenté (appel API `createSleepSession(payload)`), les autres types sont commentés ou TODO.

### 3.2. Stratégie d’erreur et retrait de la queue

- Après une exécution réussie, `syncOfflineQueue()` supprime l’item de la queue via `removeQueuedAction(item.id!)`.
- En cas d’exception, la sync s’arrête sur la première erreur (break de la boucle), pour éviter d’enchaîner des appels qui échouent en cascade et pour garder les items suivants dans la queue.

### 3.3. Quand la sync est déclenchée

- `OfflineSyncListener.tsx` est un composant client qui se charge d’écouter des événements du navigateur (par exemple `online`, `visibilitychange`) pour déclencher `syncOfflineQueue()`.
- Le composant est monté dans un layout racine, ce qui permet de resynchroniser automatiquement dès que l’utilisateur revient en ligne ou revient sur l’onglet.

***

## 4. Hooks et intégration dans l’UI

### 4.1. Hook `useOnlineStatus`

- `useOnlineStatus` encapsule l’état `navigator.onLine` et met à jour un state React sur les événements `online`/`offline`.
- Ce hook permet aux composants d’afficher une information de statut (bannière “Vous êtes hors ligne”, désactiver un bouton, etc.) sans manipuler directement les events navigateur.

### 4.2. Hooks de sessions de sommeil

- `useSleepSessions` gère la lecture et l’écriture des sessions de sommeil en combinant API distante et couche offline : utilisation de `sleepHistory`, queue de sessions et éventuellement sync après succès.
- `useSleepSessionsDetail` fournit un focus sur le détail d’une session ou d’une période, en utilisant les mêmes primitives (API + IndexedDB) pour rester fonctionnel en mode offline partiel.

### 4.3. Utilisation dans les pages et vues

- `page.tsx` (par exemple la page de domaine sommeil) consomme `useSleepSessions` et `useOnlineStatus` pour afficher les données et adapter l’UI selon la connectivité.
- `DomainDetailView.tsx` utilise ces hooks pour rendre un tableau de bord cohérent : lorsqu’une action est faite hors ligne, l’UI reste réactive grâce à l’état local + IndexedDB, la sync se faisant en tâche de fond.

***

## 5. Comment étendre et limites actuelles

### 5.1. Ajouter un nouveau type d’action offline

- Pour un nouveau type (par ex. `exercise`), il faut :
    - étendre le type `OfflineQueueItem["type"]`,
    - écrire la logique d’enqueue (ajout dans `offlineQueue` lorsque l’API échoue ou quand on veut explicitement travailler offline),
    - implémenter le `case "exercise"` dans `syncOfflineQueue()` (appel API + suppression de l’item).
- Ensuite, les hooks métier correspondants (ex. `useExerciseSessions`) pourront s’appuyer sur le même pattern que `useSleepSessions`.

### 5.2. Ajouter un nouveau store IndexedDB

- Pour un nouveau store (ex. `exerciseHistory`), il faut le créer dans la fonction `upgrade` de `getDB()` (nouvelle branche conditionnelle + éventuellement incrémenter `DB_VERSION`).
- On crée ensuite un module dédié à ce store (comme `sleepHistory.ts`) avec des helpers `save*`, `get*`, `upsert*`, utilisés par les hooks métier.

### 5.3. Limites et TODO connus

- Aujourd’hui, la sync est uniquement implémentée pour le type `"sleep"` .
- Il n’y a pas encore de stratégie avancée de retry (backoff, logs persistant, résolution de conflit entre données locales et données serveur) ni d’UI utilisateur dédiée pour gérer les erreurs de sync.

> Le service worker applique une stratégie network‑first avec mise en cache des réponses : si le réseau répond une fois (même avec des données partielles ou anciennes), ces réponses peuvent ensuite être servies depuis le cache. 
Sur mobile, cela peut faire que les fetch reçoivent des données en cache (stale) au lieu de déclencher une vraie erreur réseau, ce qui empêche la logique offline basée sur IndexedDB et la queue de sync de prendre le relais correctement.

***

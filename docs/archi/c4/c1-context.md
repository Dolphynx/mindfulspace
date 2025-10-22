```mermaid
flowchart LR
%% Contexte global MindfulSpace

subgraph internet [Internet]
userAnon[Utilisateur anonyme]
userAuth[Utilisateur authentifié]
mailSrv[Serveur SMTP]
analyticsSrv[Service externe - statistiques]
end

subgraph mindfulSpace [Système MindfulSpace]
appWeb[Application Web PWA]
apiSrv[API REST NestJS]
end

userAnon -->|Consulte pages publiques| appWeb
userAuth -->|Utilise les fonctionnalités connectées| appWeb
appWeb <--> apiSrv
apiSrv --> mailSrv
appWeb -.-> analyticsSrv
```
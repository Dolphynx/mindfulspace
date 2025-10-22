# MindfulSpace – C1 : Contexte

```mermaid
flowchart LR
    subgraph Internet[Internet]
      UserAnon[Utilisateur anonyme]
      UserAuth[Utilisateur authentifié]
      Mail[Serveur SMTP]
      ExtAnalytics[Service externe (option)]
    end

    subgraph MindfulSpace[MindfulSpace (Système)]
      App[Application Web (PWA)]
      API[(API REST)]
    end

    UserAnon -- consulte pages publiques --> App
    UserAuth -- se connecte / utilise l'app --> App
    App <---> API
    API <---> Mail
    App -. collecte anonyme .-> ExtAnalytics
```

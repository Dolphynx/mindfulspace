# MindfulSpace – C3 : Composants (Frontend Next.js)

```mermaid
flowchart TD
    subgraph Front[Next.js Frontend]
      subgraph PagesPubliques[Pages publiques (SSG/ISR)]
        Home[Home]
        Docs[Ressources]
        About[Présentation]
      end

      subgraph PagesAuth[Pages authentifiées (SSR)]
        Dashboard[Dashboard]
        HabitsUI[Habitudes]
        MeditationsUI[Méditations]
        Profile[Profil]
      end

      subgraph Infra[Infrastructure UI]
        Layout[App Layout / Shell]
        SW[Service Worker]
        IDX[IndexedDB client]
        Store[State mgmt (Context/Zustand)]
        ApiClient[Client API / fetchers]
      end
    end

    Home --> Layout
    Docs --> Layout
    About --> Layout

    Dashboard --> Layout
    HabitsUI --> Layout
    MeditationsUI --> Layout
    Profile --> Layout

    Layout --> ApiClient
    PagesAuth --> ApiClient
    ApiClient -->|/api| API[(API REST)]

    Layout --> SW
    SW --> IDX
    HabitsUI --> IDX
    MeditationsUI --> IDX
```

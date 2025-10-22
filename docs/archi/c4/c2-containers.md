# MindfulSpace – C2 : Conteneurs

```mermaid
flowchart TD
    subgraph VPS[Hôte : VPS Debian 13]
      Traefik[Reverse Proxy Traefik\n:443/:80]
      Front[Frontend Next.js (container)]
      API[NestJS API (container)]
      DB[(PostgreSQL (container, port interne))]
      Registry[(Docker Registry (externe))]
    end

    User[Client Web / Mobile] -->|HTTPS| Traefik
    Traefik -->|/| Front
    Traefik -->|/api| API
    API -->|TCP interne| DB

    subgraph CI[CI/CD GitLab]
      Runner[Runner Docker]
    end

    Runner -->|Build/Push images| Registry
    VPS -->|Pull images| Registry
```

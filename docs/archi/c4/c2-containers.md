```mermaid
flowchart TD
%% Vue conteneurs MindfulSpace (C4 - Container Diagram)

subgraph vps [Hôte VPS Debian (staging & production)]
traefik[Traefik v3.x<br/>Reverse proxy + TLS]
frontend[Frontend Next.js<br/>Image Docker (staging/prod)]
backend[NestJS API<br/>Image Docker (staging/prod)]
postgres[(PostgreSQL<br/>Volume persistant)]
dockerEngine[Docker Engine<br/>Docker Compose + Deployer]
end

subgraph cicd [GitLab CI/CD]
runner[Runner Docker<br/>Kaniko + SSH deploy]
end

subgraph registry [GitLab Container Registry]
reg[(Registry Docker<br/>Images API & Front)]
end

client[Client Web ou Mobile] -->|HTTPS :443| traefik
traefik -->|GET /| frontend
traefik -->|GET /api| backend

backend --> postgres

runner -->|build images<br/>push staging/prod| reg
dockerEngine -->|pull latest<br/>staging/prod| reg
dockerEngine --> frontend
dockerEngine --> backend
```
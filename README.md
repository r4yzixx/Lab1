# Eventia Location

Application React et quatre microservices REST (clients, matériel, réservations et notifications), chacun avec sa propre base MongoDB.

## Démarrage

Prérequis : Node.js 20+ et MongoDB local.

1. Dans chacun des quatre dossiers sous `services`, exécuter `npm install`, copier `.env.example` vers `.env`, puis exécuter `npm start`.
2. Dans `frontend`, exécuter `npm install`, puis `npm run dev`.
3. Ouvrir l'adresse indiquée par Vite.

Ports par défaut : clients 4001, matériel 4002, réservations 4003, notifications 4004. Les routes de santé sont disponibles à `/health`.

## Vérification

Depuis la racine du projet :

```text
npm test
```

Les exigences, user stories, critères d'acceptation et diagrammes UML sont dans `docs/analyse-conception.md`.

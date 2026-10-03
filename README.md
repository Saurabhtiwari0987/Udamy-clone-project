# LearnHub - 3 Tier App (React + Node.js + PostgreSQL)

- frontend/ : React (Vite)
- backend/  : Node.js + Express (env: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, PORT=5000)
- nginx/    : reverse proxy config (/ -> frontend:80, /api/ -> backend:5000)
- Dockerfiles: khud likhne hain (frontend multi-stage: node build -> nginx html)
- Sabhi containers ek custom docker network par rakhna.

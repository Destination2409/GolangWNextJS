# Fullstack Go + Next.js Microservices Starter

This is a complete starter project utilizing a microservices architecture. It uses Golang (Gin) for the backend API, Next.js for the frontend UI, MySQL for persistent storage, and Redis for caching/sessions.

## Architecture

- **Backend API**: Golang + Gin framework
- **Frontend**: Next.js (App Router) + Custom Vanilla CSS (Glassmorphism design)
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Orchestration**: Docker + Docker Compose

## Requirements

- Docker
- Docker Compose

## Getting Started

1. Clone or navigate to this folder.
2. Run the following command from the root containing `docker-compose.yml`:

```bash
docker-compose up --build
```

3. The services will be available at:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080/api/health
   - **MySQL**: localhost:3306
   - **Redis**: localhost:6379

## Features Included

- Proper routing built into Next.js.
- Clean and modern UI with custom glassmorphism styling (`globals.css`).
- Fully functional Authentication (Register, Login, JWT storage).
- A protected dashboard route (Client-side validation + Backend middleware validation).
- MySQL connection utilizing GORM + auto migrations for the `User` model.
- Redis connection initialized.

## Directory Structure

```text
/PersonalProject
│
├── docker-compose.yml
├── README.md
│
├── GolangAPI/           # Backend Go Application
│   ├── cmd/api/main.go  # Entry point
│   ├── internal/        # Handlers, models, repositories, routes, services, config
│   ├── Dockerfile       # Go Multi-stage build
│   └── go.mod
│
└── NextJSwGO/           # Frontend Next.js Application
    ├── src/app/         # Next.js Pages (login, register, dashboard)
    ├── package.json
    ├── next.config.mjs
    └── Dockerfile       # Node Multi-stage UI build
```

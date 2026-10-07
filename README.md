# NEONSHOP: Go + Next.js shop

A personal learning project: a storefront plus a staff backend. Golang (Gin) serves the API, Next.js renders the UI with the "neon shop" theme, MySQL stores the data and Redis holds auth sessions.

## Architecture

- **Backend API**: Golang + Gin framework
- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui (Base UI). Theme tokens, light/dark mode and neon utilities live in `NextJSwGO/src/app/globals.css`
- **Database**: MySQL 8.0
- **Redis**: auth session store (single-use refresh tokens, logout revocation)
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

3. The services will be available at (host ports are offset so they don't clash with other local projects):
   - **Frontend**: http://localhost:3100
   - **Backend API**: http://localhost:8180/api/health
   - **MySQL**: localhost:3317 (user `go_user` / `go_password`, db `go_db`)
   - **Redis**: localhost:6389

### Database

On the first start, MySQL runs the scripts in `docker/mysql/init/`:

- `01_schema.sql` creates all tables (users, products and the reference tables)
- `02_seed.sql` adds sample products plus local test accounts (credentials are in the comment at the top of that file)

These scripts only run when the `mysql_data` volume is empty. To wipe the data and re-seed:

```bash
docker compose down -v && docker compose up -d
```

### Tests

```bash
docker compose exec go-api go test ./...
```

## Features Included

**Storefront** (no login needed)
- Home page, product catalog with category / search / sort / in-stock filters, product detail page
- Cart stored in the browser (no checkout API yet)
- Light / dark theme toggle

**Backend** (`/backend`)
- Dashboard: product stats, products per category, low-stock list (staff) and account info (everyone)
- Product management (staff): list with search and pagination, add / edit dialog with category dropdowns, delete
- Import from Excel (`.xlsx`) or CSV with upsert by `external_id`; missing categories are created automatically. The "ตัวอย่างไฟล์นำเข้า" button downloads `Go_next_import_product_example.xlsx` with 15 sample rows and a sheet describing each column
- UI kit pages (`/backend/kit/*`) showing every theme component

**Auth**
- Register, login, Facebook login, JWT access token (60 min) + refresh token (7 days)
- Refresh tokens are single-use and stored in Redis; logout revokes both tokens server-side
- Permission levels: `permission_id` 1 = member, 2+ = staff (checked by both the UI and the API)

### API overview

| Route | Access |
|---|---|
| `POST /api/register`, `/login`, `/refresh`, `/logout`, `/facebook` | public |
| `GET /api/store/products`, `/store/products/:id`, `/store/references` | public, active products only |
| `GET /api/dashboard` | logged in |
| `GET/POST/PUT/DELETE /api/products...`, `POST /api/products/import`, `GET /api/products/import/example`, `GET /api/products/stats` | staff |

### Fonts

The theme prefers the licensed **Opun Mai** font and falls back to Prompt (Google Fonts). To use Opun Mai, put the licensed files in `NextJSwGO/public/fonts/` (`OpunMai-Regular.woff2`, `-Medium`, `-SemiBold`, `-Bold`, `-Light`).

## Directory Structure

```text
/PersonalProject
│
├── docker-compose.yml
├── README.md
├── docker/mysql/init/   # Schema + seed SQL, run on first MySQL start
│
├── GolangAPI/           # Backend Go Application
│   ├── cmd/api/main.go  # Entry point
│   ├── internal/        # Handlers, models, repositories, routes, services, config
│   ├── Dockerfile       # Go Multi-stage build
│   └── go.mod
│
└── NextJSwGO/           # Frontend Next.js Application
    ├── src/app/         # (store) storefront, backend/*, login, register
    ├── src/components/  # ui (shadcn), store, admin, backend
    ├── src/lib/         # api client, session/token handling, product mapping
    ├── public/images/   # product images used by the seed data
    ├── package.json
    ├── next.config.js
    └── Dockerfile       # Node Multi-stage UI build
```

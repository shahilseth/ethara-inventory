# StockFlow — Inventory & Order Management System

A full-stack inventory and order management system built with FastAPI, PostgreSQL, and React.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI + SQLAlchemy + PostgreSQL |
| Frontend | React + Vite + Tailwind CSS |
| Containerization | Docker + Docker Compose |
| Backend Deployment | Railway |
| Frontend Deployment | Vercel |

## Local Development

**Prerequisites:** Docker and Docker Compose installed.

```bash
# 1. Clone the repo
git clone <repo-url>
cd ethara-inventory

# 2. Create your local environment file
cp .env.example .env
# Edit .env and set POSTGRES_USER, POSTGRES_PASSWORD

# 3. Start all services
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

## API Endpoints

### Products
| Method | Endpoint | Description |
|---|---|---|
| POST | /products | Create a product |
| GET | /products | List all products |
| GET | /products/{id} | Get product by ID |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| POST | /customers | Create a customer |
| GET | /customers | List all customers |
| GET | /customers/{id} | Get customer by ID |
| DELETE | /customers/{id} | Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | /orders | Create an order |
| GET | /orders | List all orders |
| GET | /orders/{id} | Get order by ID |
| DELETE | /orders/{id} | Cancel order (restores stock) |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Health check |

## Business Logic

- Product SKU must be unique across all products
- Customer email must be unique
- Creating an order automatically deducts stock for each item
- Orders fail with 400 if any item has insufficient stock — all items are checked before any stock is modified
- Cancelling an order restores stock for all items atomically
- Order total is calculated server-side at time of order

## Environment Variables

### Root `.env` (used by Docker Compose)
| Variable | Description |
|---|---|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | PostgreSQL database name |

### `backend/.env` (used when running backend locally without Docker)
| Variable | Description |
|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string |

### `frontend/.env` (used when running frontend locally without Docker)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

## Deployment

- Backend live at: [Railway URL]
- Frontend live at: [Vercel URL]

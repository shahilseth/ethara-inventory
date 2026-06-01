# StockFlow — Inventory & Order Management System

A production-ready full-stack inventory and order management system built for Ethara.ai technical assessment.

## Live Deployment

| Service | URL |
|---|---|
| Frontend | https://ethara-inventory-git-main-shahil-seths-projects.vercel.app |
| Backend API | https://ethara-inventory-production.up.railway.app |
| API Documentation | https://ethara-inventory-production.up.railway.app/docs |
| Health Check | https://ethara-inventory-production.up.railway.app/health |
| Docker Hub | https://hub.docker.com/r/shahilseth/stockflow-backend |
| GitHub Repo | https://github.com/shahilseth/ethara-inventory |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Validation | Pydantic v2 |
| Containerization | Docker + Docker Compose |
| Backend Hosting | Railway |
| Frontend Hosting | Vercel |

## Features

### Product Management
- Create, read, update, delete products
- Unique SKU enforcement
- Stock quantity tracking
- Low stock and out of stock alerts

### Customer Management
- Create, read, delete customers
- Unique email enforcement
- Phone number validation

### Order Management
- Multi-product orders
- Automatic stock reduction on order creation
- Atomic transactions — all or nothing
- Stock restoration on order cancellation
- Automatic total calculation

### Dashboard
- Total products, customers, orders at a glance
- Low stock alerts (quantity < 10)

## Business Logic
- Product SKU must be unique — returns 409 if duplicate
- Customer email must be unique — returns 409 if duplicate
- Product quantity cannot be negative
- Orders fail if any item has insufficient stock — returns 400
- Creating an order atomically reduces stock for all items
- Cancelling an order restores stock for all items
- Order total is calculated server-side automatically

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
| DELETE | /orders/{id} | Cancel order + restore stock |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Service health check |

## Local Development

### Prerequisites
- Docker Desktop
- Git

### Setup

1. Clone the repository
```bash
git clone https://github.com/shahilseth/ethara-inventory.git
cd ethara-inventory
```

2. Create environment file
```bash
cp .env.example .env
```

3. Start all services
```bash
docker-compose up --build
```

4. Access the application

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

### Stop services
```bash
docker-compose down
```

### Reset database
```bash
docker-compose down -v
docker-compose up --build
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| POSTGRES_USER | PostgreSQL username | ethara_user |
| POSTGRES_PASSWORD | PostgreSQL password | your_password |
| POSTGRES_DB | PostgreSQL database name | ethara_inventory |
| DATABASE_URL | Full PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| VITE_API_URL | Backend API URL for frontend | http://localhost:8000 |

## Docker Services

| Service | Image | Port |
|---|---|---|
| Frontend | node:18-alpine + nginx:alpine | 3000 |
| Backend | python:3.11-slim | 8000 |
| Database | postgres:15-alpine | 5432 |

## Project Structure

```
ethara-inventory/
├── backend/
│   ├── app/
│   │   ├── main.py          — FastAPI app + CORS + router registration
│   │   ├── database.py      — SQLAlchemy engine + session
│   │   ├── models/          — SQLAlchemy ORM models
│   │   ├── schemas/         — Pydantic request/response schemas
│   │   └── routers/         — API route handlers
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             — Axios API calls
│   │   ├── components/      — Reusable UI components
│   │   └── pages/           — Dashboard, Products, Customers, Orders
│   ├── Dockerfile
│   └── vercel.json
└── docker-compose.yml
```

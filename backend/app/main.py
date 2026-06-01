from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import customers, orders, products


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="StockFlow API",
    description="Inventory & Order Management System",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ethara-inventory.vercel.app",
        "https://ethara-inventory-git-main-shahil-seths-projects.vercel.app",
        "https://ethara-inventory-dboxxihbl-shahil-seths-projects.vercel.app",
        "https://*.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(customers.router, prefix="/customers", tags=["customers"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": "stockflow-api", "version": "1.0.0"}

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int = Field(ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = Field(default=None, ge=0)


class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

    @field_validator('price', mode='before')
    @classmethod
    def parse_price(cls, v):
        return round(float(v), 2) if v is not None else v

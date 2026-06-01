from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class OrderItemInput(BaseModel):
    product_id: UUID
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: UUID
    items: List[OrderItemInput] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    product_id: UUID
    quantity: int
    unit_price: float
    product_name: str

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def flatten_product_name(cls, obj):
        if not isinstance(obj, dict):
            return {
                "product_id": obj.product_id,
                "quantity": obj.quantity,
                "unit_price": obj.unit_price,
                "product_name": obj.product.name if obj.product else "",
            }
        return obj

    @field_validator('unit_price', mode='before')
    @classmethod
    def parse_unit_price(cls, v):
        return round(float(v), 2) if v is not None else v


class OrderResponse(BaseModel):
    id: UUID
    customer_id: UUID
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)

    @field_validator('total_amount', mode='before')
    @classmethod
    def parse_total(cls, v):
        return round(float(v), 2) if v is not None else v

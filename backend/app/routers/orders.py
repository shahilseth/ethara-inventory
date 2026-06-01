from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter()


def _load_order(db: Session, order_id: UUID) -> Order:
    return (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    if not db.query(Customer).filter(Customer.id == order_in.customer_id).first():
        raise HTTPException(status_code=404, detail="Customer not found")

    # Fetch all products first, deduplicated by id
    product_map: dict[str, Product] = {}
    for item in order_in.items:
        key = str(item.product_id)
        if key not in product_map:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            product_map[key] = product

    # Check ALL stock levels before touching anything
    for item in order_in.items:
        product = product_map[str(item.product_id)]
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for product: {product.name}, "
                    f"available: {product.quantity}, requested: {item.quantity}"
                ),
            )

    try:
        total = sum(
            product_map[str(i.product_id)].price * i.quantity for i in order_in.items
        )

        for item in order_in.items:
            product_map[str(item.product_id)].quantity -= item.quantity

        db_order = Order(customer_id=order_in.customer_id, total_amount=total)
        db.add(db_order)
        db.flush()  # assign db_order.id before creating items

        for item in order_in.items:
            db.add(
                OrderItem(
                    order_id=db_order.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    unit_price=product_map[str(item.product_id)].price,
                )
            )

        db.commit()
    except Exception:
        db.rollback()
        raise

    return _load_order(db, db_order.id)


@router.get("", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    return (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .all()
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: UUID, db: Session = Depends(get_db)):
    order = _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}")
def cancel_order(order_id: UUID, db: Session = Depends(get_db)):
    order = _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.quantity += item.quantity
        db.delete(order)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"detail": "Order cancelled and stock restored"}

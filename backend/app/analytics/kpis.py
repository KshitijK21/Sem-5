"""KPI computations over the warehouse.

Definitions are documented in docs/KPIs.md. All values are derived from loaded
Olist data; nothing is fabricated. Revenue = sum of order item prices.

Filters (all optional): date_from, date_to (ISO dates), order_status.
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Session


def _where(date_from: Optional[str], date_to: Optional[str], order_status: Optional[str]):
    clauses = ["1=1"]
    params: dict = {}
    if date_from:
        clauses.append("purchase_date >= :date_from")
        params["date_from"] = date_from
    if date_to:
        clauses.append("purchase_date <= :date_to")
        params["date_to"] = date_to
    if order_status:
        clauses.append("order_status = :order_status")
        params["order_status"] = order_status
    return " AND ".join(clauses), params


def get_kpis(
    db: Session,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    order_status: Optional[str] = None,
) -> dict:
    where, params = _where(date_from, date_to, order_status)

    orders_sql = text(
        f"""
        SELECT
            COUNT(*) AS total_orders,
            COALESCE(SUM(item_revenue), 0) AS total_revenue,
            COALESCE(SUM(freight_value), 0) AS total_freight,
            COUNT(DISTINCT customer_unique_id) AS unique_customers,
            AVG(review_score) AS avg_review_score,
            AVG(delivery_days) AS avg_delivery_days
        FROM fact_orders
        WHERE {where}
        """
    )
    o = db.execute(orders_sql, params).mappings().one()

    items_sql = text(
        f"""
        SELECT
            COUNT(*) AS items_sold,
            COUNT(DISTINCT seller_id) AS active_sellers,
            COUNT(DISTINCT product_id) AS products_sold
        FROM fact_order_items i
        JOIN fact_orders o ON o.order_id = i.order_id
        WHERE {where.replace('purchase_date', 'o.purchase_date').replace('order_status', 'o.order_status')}
        """
    )
    it = db.execute(items_sql, params).mappings().one()

    total_orders = int(o["total_orders"] or 0)
    total_revenue = float(o["total_revenue"] or 0.0)
    aov = round(total_revenue / total_orders, 2) if total_orders else 0.0

    return {
        "filters": {
            "date_from": date_from,
            "date_to": date_to,
            "order_status": order_status,
        },
        "kpis": {
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "total_freight": round(float(o["total_freight"] or 0.0), 2),
            "avg_order_value": aov,
            "unique_customers": int(o["unique_customers"] or 0),
            "items_sold": int(it["items_sold"] or 0),
            "products_sold": int(it["products_sold"] or 0),
            "active_sellers": int(it["active_sellers"] or 0),
            "avg_review_score": round(float(o["avg_review_score"]), 3)
            if o["avg_review_score"] is not None
            else None,
            "avg_delivery_days": round(float(o["avg_delivery_days"]), 2)
            if o["avg_delivery_days"] is not None
            else None,
        },
    }


def month_expr(db: Session, column: str = "purchase_date") -> str:
    """Return a dialect-appropriate year-month expression for `column`."""
    dialect = db.get_bind().dialect.name
    if dialect == "postgresql":
        return f"to_char({column}, 'YYYY-MM')"
    if dialect in {"mysql", "mariadb"}:
        return f"date_format({column}, '%Y-%m')"
    return f"strftime('%Y-%m', {column})"


def monthly_revenue(db: Session, limit: int = 24) -> list[dict]:
    period = month_expr(db)
    sql = text(
        f"""
        SELECT
            {period} AS period,
            COUNT(*) AS orders,
            COALESCE(SUM(item_revenue), 0) AS revenue
        FROM fact_orders
        WHERE purchase_date IS NOT NULL
        GROUP BY period
        ORDER BY period
        """
    )
    rows = db.execute(sql).mappings().all()
    return [
        {
            "period": r["period"],
            "orders": int(r["orders"] or 0),
            "revenue": round(float(r["revenue"] or 0.0), 2),
        }
        for r in rows
    ][-limit:]


def revenue_by_category(db: Session, limit: int = 15) -> list[dict]:
    sql = text(
        """
        SELECT
            COALESCE(product_category_name_en, 'unknown') AS category,
            COALESCE(SUM(price), 0) AS revenue,
            COUNT(*) AS items
        FROM fact_order_items
        GROUP BY category
        ORDER BY revenue DESC
        LIMIT :limit
        """
    )
    rows = db.execute(sql, {"limit": limit}).mappings().all()
    return [
        {"category": r["category"], "revenue": round(float(r["revenue"] or 0.0), 2), "items": int(r["items"] or 0)}
        for r in rows
    ]


def orders_by_status(db: Session) -> list[dict]:
    sql = text(
        """
        SELECT COALESCE(order_status, 'unknown') AS status, COUNT(*) AS orders
        FROM fact_orders
        GROUP BY status
        ORDER BY orders DESC
        """
    )
    rows = db.execute(sql).mappings().all()
    return [{"status": r["status"], "orders": int(r["orders"] or 0)} for r in rows]

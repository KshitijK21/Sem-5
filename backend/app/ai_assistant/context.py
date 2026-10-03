"""Controlled context retrieval for the AI assistant.

The assistant never receives arbitrary database access. This module exposes a
small, fixed set of real aggregates from the warehouse, scoped by role
(principle of least privilege).
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.analytics import kpis as kpi_service
from app.services import ml as ml_service


def build_context(db: Session, role: str = "viewer") -> dict:
    context: dict = {
        "dataset": "Olist Brazilian e-commerce (Sep 2016 - Oct 2018)",
        "kpis": kpi_service.get_kpis(db)["kpis"],
    }
    if role in {"analyst", "admin"}:
        monthly = kpi_service.monthly_revenue(db)
        context["monthly_revenue_last12"] = monthly[-12:]
        context["revenue_by_category_top10"] = kpi_service.revenue_by_category(db)[:10]
        context["orders_by_status"] = kpi_service.orders_by_status(db)
        context["ml_features"] = [
            {"name": f["name"], "status": f["status"]} for f in ml_service.feature_status()
        ]
    return context


def summarize(context: dict) -> str:
    """Deterministic, data-grounded fallback when no LLM is available."""
    k = context.get("kpis", {})
    lines = [
        "LLM assistant is not configured; showing a deterministic summary of current data.",
        "",
        f"- Total orders: {k.get('total_orders'):,}" if k.get("total_orders") else "",
        f"- Total revenue (item prices): R$ {k.get('total_revenue'):,.0f}"
        if k.get("total_revenue")
        else "",
        f"- Average order value: R$ {k.get('avg_order_value'):.2f}"
        if k.get("avg_order_value")
        else "",
        f"- Unique customers: {k.get('unique_customers'):,}" if k.get("unique_customers") else "",
        f"- Average review score: {k.get('avg_review_score')}"
        if k.get("avg_review_score")
        else "",
    ]
    cats = context.get("revenue_by_category_top10")
    if cats:
        top = cats[0]
        lines.append(f"- Top category by revenue: {top['category']}")
    return "\n".join(line for line in lines if line)


def build_prompt(question: str, context: dict) -> str:
    import json

    return (
        "You are a business-intelligence assistant for an e-commerce BI platform. "
        "Answer ONLY using the JSON context provided. If the answer is not in the "
        "context, say you don't have that data. Be concise and cite numbers.\n\n"
        f"Context JSON:\n{json.dumps(context, default=str)}\n\n"
        f"Question: {question}\nAnswer:"
    )

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.ai_assistant import context as ctx
from app.ai_assistant.provider import ProviderFactory, provider_status
from app.api.deps import get_optional_user
from app.database.deps import get_db

router = APIRouter()


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)
    context_limit: int = Field(20, ge=1, le=50)


@router.get("/status")
def insights_status():
    return provider_status()


@router.post("/query")
def insights_query(
    payload: QueryRequest,
    db: Session = Depends(get_db),
    user: dict | None = Depends(get_optional_user),
):
    role = (user or {}).get("role", "viewer")

    try:
        context = ctx.build_context(db, role)
        sources = ["warehouse.kpis"] + (
            ["warehouse.monthly_revenue", "warehouse.categories", "ml.status"]
            if role in {"analyst", "admin"}
            else []
        )
    except Exception:
        context = {"note": "warehouse not loaded; run ETL for full context"}
        sources = []

    provider = ProviderFactory.get_provider()
    prompt = ctx.build_prompt(payload.question, context)
    result = provider.generate(prompt, context)

    if result.get("status") == "available":
        answer, status = result["text"], "available"
    else:
        answer, status = ctx.summarize(context), "llm_unavailable"

    return {
        "answer": answer,
        "sources": sources,
        "status": status,
        "provider": result.get("provider"),
        "role": role,
    }

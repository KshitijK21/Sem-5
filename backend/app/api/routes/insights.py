# Insights routes stub
from fastapi import APIRouter

router = APIRouter()

@router.post("/query")
def insights_query(payload: dict):
    # Controlled; honest fallback if LLM unavailable
    question = payload.get('question', '')
    return {
        "answer": f"Assistant not configured. Received: {question[:80]}",
        "sources": [],
        "status": "llm_unavailable"
    }

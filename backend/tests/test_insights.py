def test_insights_query_returns_answer(client):
    r = client.post("/api/insights/query", json={"question": "What is total revenue?"})
    assert r.status_code == 200
    body = r.json()
    assert body["answer"]
    assert body["status"] in {"available", "llm_unavailable"}
    assert "role" in body


def test_insights_rejects_empty_question(client):
    assert client.post("/api/insights/query", json={"question": ""}).status_code == 422


def test_insights_status_reports_provider(client):
    r = client.get("/api/insights/status")
    assert r.status_code == 200
    body = r.json()
    assert "enabled" in body and "provider" in body and "reachable" in body
    assert "fallback" in body

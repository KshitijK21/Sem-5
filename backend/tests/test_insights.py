def test_insights_query_returns_answer(client):
    r = client.post("/api/insights/query", json={"question": "What is total revenue?"})
    assert r.status_code == 200
    body = r.json()
    assert body["answer"]
    assert body["status"] in {"available", "llm_unavailable"}
    assert "role" in body


def test_insights_rejects_empty_question(client):
    assert client.post("/api/insights/query", json={"question": ""}).status_code == 422

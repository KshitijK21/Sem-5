import pytest


def test_kpis_csv_export(client, auth, warehouse_ready):
    if not warehouse_ready:
        pytest.skip("warehouse not loaded (run backend ETL)")
    r = client.get("/api/reports/export?report=kpis", headers=auth)
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/csv")
    assert "metric,value" in r.text


def test_monthly_export_requires_analyst(client, auth, viewer_token, warehouse_ready):
    if not warehouse_ready:
        pytest.skip("warehouse not loaded (run backend ETL)")
    viewer = {"Authorization": f"Bearer {viewer_token}"}
    assert client.get("/api/reports/export?report=monthly_revenue", headers=viewer).status_code == 403
    assert client.get("/api/reports/export?report=monthly_revenue", headers=auth).status_code == 200


def test_unknown_report_returns_404(client, auth):
    assert client.get("/api/reports/export?report=does_not_exist", headers=auth).status_code == 404

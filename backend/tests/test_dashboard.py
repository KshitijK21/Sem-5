import pytest


def test_health_kpis(client, warehouse_ready):
    if not warehouse_ready:
        pytest.skip("warehouse not loaded (run backend ETL)")

    r = client.get("/api/dashboard/kpis")
    assert r.status_code == 200
    k = r.json()["kpis"]
    assert k["total_orders"] > 0
    assert k["total_revenue"] > 0
    assert k["avg_order_value"] > 0


def test_monthly_revenue_series(client, warehouse_ready):
    if not warehouse_ready:
        pytest.skip("warehouse not loaded (run backend ETL)")

    r = client.get("/api/dashboard/monthly-revenue")
    assert r.status_code == 200
    series = r.json()["series"]
    assert len(series) >= 12
    assert {"period", "orders", "revenue"} <= set(series[0].keys())

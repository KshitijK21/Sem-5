"""End-to-end ML inference tests.

These tests prove the acceptance chain for every model:
artifact load -> feature construction -> model.predict() -> API response.

- Real-inference tests run the actual joblib artifacts against the live
  warehouse (skipped only when an artifact/warehouse is genuinely absent,
  e.g. a fresh clone where ml/models is gitignored).
- Invocation tests spy on model.predict to prove the model really executed.
- Error tests prove failures return honest status codes, never fake data.
"""

from __future__ import annotations

from unittest.mock import patch

import pytest

from app.services import ml as ml_service
from app.services import ml_features

EXPECTED_FEATURES = {
    "sales_forecast",
    "sales_prediction",
    "customer_segmentation",
    "product_segmentation",
    "anomaly_detection",
}

PREDICT_PAYLOAD = {
    "purchase_month": 11,
    "purchase_weekday": 4,
    "purchase_hour": 15,
    "n_items": 2,
    "customer_state": "SP",
    "product_category_name": "bed_bath_table",
}


def _require(model_name: str, warehouse_ready: bool) -> None:
    if not warehouse_ready:
        pytest.skip("warehouse not loaded")
    if not ml_service.artifact_available(model_name):
        pytest.skip(f"artifact for {model_name} not trained in this environment")


def _clear_caches():
    ml_service._load_artifact.cache_clear()


# ---------------------------------------------------------------------------
# A. order forecast
# ---------------------------------------------------------------------------


def test_order_forecast_real_inference(client, analyst_auth, warehouse_ready):
    _require("sales_forecast_orders", warehouse_ready)
    r = client.get("/api/ml/forecast?periods=7", headers=analyst_auth)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["model"] == "sales_forecast_orders"
    assert body["target"] == "orders"
    assert body["unit"] == "orders"
    assert len(body["forecast"]) == 7
    assert len(body["history_tail"]) == 30
    dates = [p["date"] for p in body["forecast"]]
    assert dates == sorted(dates)
    assert dates[0] > body["history_tail"][-1]["date"]
    values = [p["value"] for p in body["forecast"]]
    assert all(isinstance(v, float) for v in values)
    assert all(v >= 0 for v in values)
    # training/evaluation metrics are reported separately from the forecast
    assert body["metrics"]["model"]["mae"] > 0
    assert body["metrics"]["seasonal_naive_baseline"]["mae"] > 0
    assert body["metadata"]["n_history_days"] >= 30


def test_order_forecast_executes_model_predict(client, analyst_auth, warehouse_ready):
    _require("sales_forecast_orders", warehouse_ready)
    calls: list[int] = []
    restored: list[tuple] = []
    real_load = ml_service._load_artifact

    def spy(name):
        bundle = real_load(name)
        model = bundle["model"]
        original = model.predict

        def counting(X, *args, **kwargs):
            calls.append(len(X))
            return original(X, *args, **kwargs)

        model.predict = counting
        restored.append((model, original))
        return bundle

    try:
        with patch.object(ml_service, "_load_artifact", side_effect=spy):
            r = client.get("/api/ml/forecast?periods=5", headers=analyst_auth)
    finally:
        for obj, original in restored:
            obj.predict = original
    assert r.status_code == 200, r.text
    # one predict call per forecast step proves recursive inference ran
    assert len(calls) == 5
    assert r.json()["forecast"][0]["value"] >= 0


def test_forecast_revenue_is_a_separate_model(client, analyst_auth, warehouse_ready):
    _require("sales_forecast_revenue", warehouse_ready)
    r_orders = client.get("/api/ml/forecast?periods=7", headers=analyst_auth)
    r_rev = client.get("/api/ml/forecast?periods=7&target=revenue", headers=analyst_auth)
    assert r_rev.status_code == 200, r_rev.text
    body = r_rev.json()
    assert body["model"] == "sales_forecast_revenue"
    assert body["target"] == "revenue"
    assert body["unit"] == "BRL"
    assert len(body["forecast"]) == 7
    rev_values = [p["value"] for p in body["forecast"]]
    order_values = [p["value"] for p in r_orders.json()["forecast"]]
    # revenue must come from its own model, not copied order counts
    assert rev_values != order_values
    assert all(v > 100 for v in rev_values)  # BRL magnitudes, not order counts


def test_forecast_invalid_period_and_target(client, analyst_auth):
    assert client.get("/api/ml/forecast?periods=0", headers=analyst_auth).status_code == 400
    assert client.get("/api/ml/forecast?periods=91", headers=analyst_auth).status_code == 400
    r = client.get("/api/ml/forecast?target=bogus", headers=analyst_auth)
    assert r.status_code == 422
    assert "orders" in r.json()["detail"]


def test_forecast_missing_artifact_returns_503(client, analyst_auth, tmp_path):
    _clear_caches()
    try:
        with patch.object(ml_service, "models_dir", return_value=tmp_path):
            r = client.get("/api/ml/forecast?periods=5", headers=analyst_auth)
    finally:
        _clear_caches()
    assert r.status_code == 503
    assert "train" in r.json()["detail"].lower()


def test_forecast_insufficient_history_returns_409(client, analyst_auth, warehouse_ready):
    if not warehouse_ready:
        pytest.skip("warehouse not loaded")
    import pandas as pd

    short = pd.DataFrame(
        {
            "date": pd.date_range("2018-01-01", periods=10),
            "orders": [5.0] * 10,
            "revenue": [100.0] * 10,
        }
    )
    with patch.object(ml_features, "daily_series", return_value=short):
        r = client.get("/api/ml/forecast?periods=5", headers=analyst_auth)
    assert r.status_code == 409
    assert "30 days" in r.json()["detail"]


def test_forecast_invalid_date_filter(client, analyst_auth):
    assert (
        client.get("/api/ml/forecast?date_from=2018-02-30", headers=analyst_auth).status_code
        == 422
    )
    assert (
        client.get(
            "/api/ml/forecast?date_from=2018-06-01&date_to=2018-01-01",
            headers=analyst_auth,
        ).status_code
        == 422
    )


# ---------------------------------------------------------------------------
# B. customer segmentation
# ---------------------------------------------------------------------------


def test_customer_segmentation_real_inference(client, analyst_auth, warehouse_ready):
    _require("customer_segmentation", warehouse_ready)
    r = client.get("/api/ml/segments/customers", headers=analyst_auth)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["model"] == "customer_segmentation"
    assert body["status"] == "success"
    inf = body["inference"]
    assert inf["features"] == ["recency_days", "frequency", "monetary_log"]
    assert inf["n_customers"] > 90_000
    assert sum(c["customers"] for c in inf["clusters"]) == inf["n_customers"]
    assert len(inf["clusters"]) == inf["k"]
    shares = sum(c["share"] for c in inf["clusters"])
    assert shares == pytest.approx(1.0, abs=1e-6)
    for c in inf["clusters"]:
        assert c["mean_monetary"] > 0
        assert c["mean_frequency"] >= 1
    # training metrics reported separately from live inference
    assert body["metrics"]["silhouette"] > 0
    assert body["metadata"]["artifact"] == "customer_segmentation.joblib"


def test_customer_segmentation_executes_kmeans_predict(client, analyst_auth, warehouse_ready):
    _require("customer_segmentation", warehouse_ready)
    row_counts: list[int] = []
    restored: list[tuple] = []
    real_load = ml_service._load_artifact

    def spy(name):
        bundle = real_load(name)
        model = bundle["model"]
        original = model.predict

        def counting(X, *args, **kwargs):
            row_counts.append(len(X))
            return original(X, *args, **kwargs)

        model.predict = counting
        restored.append((model, original))
        return bundle

    try:
        with patch.object(ml_service, "_load_artifact", side_effect=spy):
            r = client.get("/api/ml/segments/customers", headers=analyst_auth)
    finally:
        for obj, original in restored:
            obj.predict = original
    assert r.status_code == 200, r.text
    assert row_counts and row_counts[0] == r.json()["inference"]["n_customers"]


def test_customer_segmentation_artifact_failure_returns_503(client, analyst_auth):
    def boom(name):
        raise ml_service.ArtifactError("simulated load failure")

    with patch.object(ml_service, "_load_artifact", side_effect=boom):
        r = client.get("/api/ml/segments/customers", headers=analyst_auth)
    assert r.status_code == 503


# ---------------------------------------------------------------------------
# C. product segmentation
# ---------------------------------------------------------------------------


def test_product_segmentation_real_inference(client, analyst_auth, warehouse_ready):
    _require("product_segmentation", warehouse_ready)
    r = client.get("/api/ml/segments/products", headers=analyst_auth)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["model"] == "product_segmentation"
    inf = body["inference"]
    assert inf["features"] == ["qty_log", "revenue_log", "avg_price", "product_weight_g"]
    assert inf["n_products"] > 30_000
    assert sum(c["products"] for c in inf["clusters"]) == inf["n_products"]
    assert len(inf["clusters"]) == inf["k"]
    assert all(c["mean_total_revenue"] > 0 for c in inf["clusters"])
    assert body["metrics"]["silhouette"] > 0


def test_product_segmentation_executes_kmeans_predict(client, analyst_auth, warehouse_ready):
    _require("product_segmentation", warehouse_ready)
    row_counts: list[int] = []
    restored: list[tuple] = []
    real_load = ml_service._load_artifact

    def spy(name):
        bundle = real_load(name)
        model = bundle["model"]
        original = model.predict

        def counting(X, *args, **kwargs):
            row_counts.append(len(X))
            return original(X, *args, **kwargs)

        model.predict = counting
        restored.append((model, original))
        return bundle

    try:
        with patch.object(ml_service, "_load_artifact", side_effect=spy):
            r = client.get("/api/ml/segments/products", headers=analyst_auth)
    finally:
        for obj, original in restored:
            obj.predict = original
    assert r.status_code == 200, r.text
    assert row_counts and row_counts[0] == r.json()["inference"]["n_products"]


# ---------------------------------------------------------------------------
# D. anomaly detection
# ---------------------------------------------------------------------------


def test_anomaly_detection_real_inference(client, analyst_auth, warehouse_ready):
    _require("anomaly_detection", warehouse_ready)
    r = client.get("/api/ml/anomalies", headers=analyst_auth)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["model"] == "anomaly_detection"
    inf = body["inference"]
    assert inf["n_days"] >= 600
    assert 0 < inf["n_anomalies"] <= inf["n_days"]
    assert inf["anomaly_share"] == pytest.approx(inf["n_anomalies"] / inf["n_days"])
    assert inf["contamination"] == 0.03
    tops = inf["top_anomalies"]
    assert tops, "anomalies were expected on the full dataset"
    scores = [a["score"] for a in tops]
    assert scores == sorted(scores), "anomalies sorted by score ascending"
    for a in tops:
        assert a["is_anomaly"] is True
        assert isinstance(a["orders"], int) and isinstance(a["revenue"], float)
        assert a["date"].startswith("20")
    assert inf["evaluated_from"] <= inf["evaluated_to"]


def test_anomaly_detection_executes_isolation_forest(client, analyst_auth, warehouse_ready):
    _require("anomaly_detection", warehouse_ready)
    predict_rows: list[int] = []
    score_rows: list[int] = []
    restored: list[tuple] = []
    real_load = ml_service._load_artifact

    def spy(name):
        bundle = real_load(name)
        model = bundle["model"]
        orig_predict, orig_score = model.predict, model.decision_function

        def counting_predict(X, *args, **kwargs):
            predict_rows.append(len(X))
            return orig_predict(X, *args, **kwargs)

        def counting_score(X, *args, **kwargs):
            score_rows.append(len(X))
            return orig_score(X, *args, **kwargs)

        model.predict = counting_predict
        model.decision_function = counting_score
        restored.append((model, orig_predict, orig_score))
        return bundle

    try:
        with patch.object(ml_service, "_load_artifact", side_effect=spy):
            r = client.get("/api/ml/anomalies", headers=analyst_auth)
    finally:
        for obj, orig_predict, orig_score in restored:
            obj.predict = orig_predict
            obj.decision_function = orig_score
    assert r.status_code == 200, r.text
    n_days = r.json()["inference"]["n_days"]
    assert predict_rows == [n_days]
    # decision_function is scored for every row (predict may call it internally too)
    assert score_rows and all(count == n_days for count in score_rows)


def test_anomaly_detection_respects_date_filters(client, analyst_auth, warehouse_ready):
    _require("anomaly_detection", warehouse_ready)
    full = client.get("/api/ml/anomalies", headers=analyst_auth).json()["inference"]
    part = client.get(
        "/api/ml/anomalies?date_from=2017-01-01&date_to=2017-12-31",
        headers=analyst_auth,
    )
    assert part.status_code == 200
    inf = part.json()["inference"]
    assert inf["n_days"] < full["n_days"]
    assert 300 <= inf["n_days"] <= 400
    assert inf["evaluated_from"] >= "2017-01-01"
    assert inf["evaluated_to"] <= "2017-12-31"


# ---------------------------------------------------------------------------
# E. sales prediction
# ---------------------------------------------------------------------------


def test_sales_prediction_real_inference(client, analyst_auth, warehouse_ready):
    _require("sales_prediction", warehouse_ready)
    r = client.post("/api/ml/predict/sales", json=PREDICT_PAYLOAD, headers=analyst_auth)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["model"] == "sales_prediction"
    assert body["target"] == "item_revenue"
    assert body["currency"] == "BRL"
    assert isinstance(body["predicted_item_revenue"], float)
    assert body["predicted_item_revenue"] > 0
    assert body["metrics"]["candidates"]["linear_regression"]["mae"] > 0
    assert body["algorithm"].startswith("best of")


def test_sales_prediction_executes_pipeline_predict(client, analyst_auth, warehouse_ready):
    _require("sales_prediction", warehouse_ready)
    rows: list[int] = []
    restored: list[tuple] = []
    real_load = ml_service._load_artifact

    def spy(name):
        bundle = real_load(name)
        pipe = bundle["pipeline"]
        original = pipe.predict

        def counting(X, *args, **kwargs):
            rows.append(len(X))
            return original(X, *args, **kwargs)

        pipe.predict = counting
        restored.append((pipe, original))
        return bundle

    try:
        with patch.object(ml_service, "_load_artifact", side_effect=spy):
            r = client.post("/api/ml/predict/sales", json=PREDICT_PAYLOAD, headers=analyst_auth)
    finally:
        for obj, original in restored:
            obj.predict = original
    assert r.status_code == 200, r.text
    assert rows == [1]


def test_sales_prediction_invalid_input(client, analyst_auth, warehouse_ready):
    _require("sales_prediction", warehouse_ready)
    # out-of-range field -> 422
    bad = {**PREDICT_PAYLOAD, "purchase_month": 13}
    assert client.post("/api/ml/predict/sales", json=bad, headers=analyst_auth).status_code == 422
    # missing fields -> 422
    assert (
        client.post("/api/ml/predict/sales", json={"purchase_month": 5}, headers=analyst_auth).status_code
        == 422
    )
    # non-numeric field -> 422
    non_numeric = {**PREDICT_PAYLOAD, "n_items": "two"}
    assert (
        client.post("/api/ml/predict/sales", json=non_numeric, headers=analyst_auth).status_code
        == 422
    )


def test_sales_prediction_missing_artifact_returns_503(client, analyst_auth, tmp_path):
    _clear_caches()
    try:
        with patch.object(ml_service, "models_dir", return_value=tmp_path):
            r = client.post("/api/ml/predict/sales", json=PREDICT_PAYLOAD, headers=analyst_auth)
    finally:
        _clear_caches()
    assert r.status_code == 503


# ---------------------------------------------------------------------------
# F. registry truthfulness + authorization
# ---------------------------------------------------------------------------


def test_status_reports_truthful_inference_state(client, analyst_auth):
    r = client.get("/api/ml/status", headers=analyst_auth)
    assert r.status_code == 200
    features = r.json()["features"]
    assert EXPECTED_FEATURES <= {f["name"] for f in features}
    for f in features:
        for m in f["models"]:
            assert m["inference"] in {"inference_ready", "unavailable", "inference_failed"}
            assert m["trained"] is True
            if m["inference"] == "inference_ready":
                assert m["artifact_available"] is True
                assert m["reason"] is None
                assert f["status"] == "available"
            else:
                assert m["reason"], "unready models must explain why"
                assert f["status"] != "available"
            if m["inference"] == "inference_failed":
                assert f["status"] == "failed"


def test_model_detail_exposes_serving_state(client, analyst_auth, warehouse_ready):
    _require("anomaly_detection", warehouse_ready)
    r = client.get("/api/ml/models/anomaly_detection", headers=analyst_auth)
    assert r.status_code == 200
    body = r.json()
    assert body["serving"]["inference"] == "inference_ready"
    assert body["algorithm"] == "IsolationForest"
    assert client.get("/api/ml/models/nope", headers=analyst_auth).status_code == 404


def test_ml_endpoints_require_authentication(client):
    for path in (
        "/api/ml/status",
        "/api/ml/forecast?periods=5",
        "/api/ml/forecast?periods=5&target=revenue",
        "/api/ml/segments/customers",
        "/api/ml/segments/products",
        "/api/ml/anomalies",
        "/api/ml/models/anomaly_detection",
    ):
        assert client.get(path).status_code == 401, path
    assert (
        client.post("/api/ml/predict/sales", json=PREDICT_PAYLOAD).status_code == 401
    )


def test_ml_endpoints_available_to_analyst_and_admin(client, analyst_auth, auth, warehouse_ready):
    for headers in (analyst_auth, auth):
        for path in (
            "/api/ml/status",
            "/api/ml/forecast?periods=5",
            "/api/ml/segments/customers",
            "/api/ml/segments/products",
            "/api/ml/anomalies",
        ):
            if not warehouse_ready and "status" not in path:
                continue
            assert client.get(path, headers=headers).status_code in {200, 503}, path

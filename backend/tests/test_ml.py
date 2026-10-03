EXPECTED_FEATURES = {
    "sales_forecast",
    "sales_prediction",
    "customer_segmentation",
    "product_segmentation",
    "anomaly_detection",
}


def test_ml_status_lists_all_features(client):
    r = client.get("/api/ml/status")
    assert r.status_code == 200
    names = {f["name"] for f in r.json()["features"]}
    assert EXPECTED_FEATURES <= names


def test_ml_status_is_honest(client):
    for f in client.get("/api/ml/status").json()["features"]:
        assert f["status"] in {
            "planned",
            "data_preparation",
            "training",
            "testing",
            "integration",
            "available",
            "failed",
        }

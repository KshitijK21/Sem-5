## Status
- Working dir: C:\Users\Kshitij\Downloads\sem-5 (local repo)
- Remote: https://github.com/KshitijK21/Sem-5.git
- Checklist: see docs/CHECKLIST.md

## Warehouse (done)
- ETL loaded real Olist data into the star schema; verified KPIs in docs/KPIs.md.
- Dashboard wired to real KPI/chart APIs.

## ML (done, parallel track)
- Datasets built (ml/data/processed, gitignored).
- 5 features trained and evaluated on real data:
  - sales_forecast (LinearRegression, beats seasonal-naive baseline)
  - sales_prediction (best of LinearRegression / RandomForest)
  - customer_segmentation (KMeans, k=2, silhouette 0.686)
  - product_segmentation (KMeans, k=4, silhouette 0.480)
  - anomaly_detection (IsolationForest; flags Black Friday 2017-11-24)
- Metrics: docs/ML_BASELINES.md + ml/models/*.metadata.json.
- Backend serves models via /api/ml (status, forecast, segments, anomalies, predict/sales).
- Artifacts gitignored (reproducible via `cd ml && python run_all.py`).

## Next
- Build ML pages in the frontend (forecast chart, segments, anomalies) against /api/ml.
- Real auth/RBAC, remaining analytics pages.
- AI insights (LLM, provider-agnostic) wiring.
- Run the test suite (Phase 9.2).

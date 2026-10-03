# ML_DOCUMENTATION.md (draft)

## Objectives
- Sales/demand forecasting (time-series)
- Sales prediction (regression)
- Customer segmentation (clustering, RFM-informed)
- Product segmentation (clustering)
- Anomaly detection (unsupervised)

## Data
- Source: Olist (external). Processed data in ml/data/processed/ (excluded from Git). 
- Train/test split by time for forecasting; stratified/random as appropriate. Avoid leakage.

## Interfaces (contracts)
- Model metadata: {name, version, target, trained_at, dataset_fingerprint, features_schema, metrics, status}
- Prediction input/output schemas per model (Pydantic-style). 
- ML status endpoint returns per-feature status (planned/training/testing/integration/available/failed).

## Statuses
- planned | data_preparation | training | testing | integration | available | failed

## Integration
- Models serialized (joblib/pkl). Backend loads on demand with validation. 
- Website shows honest status before availability; no fake predictions/metrics.
- Parallel dev: contracts fixed; FE can display feature cards with status now.

## Known constraints
- Historical only (2016-09). 
- Reviews/comments sparse; prefer numeric/structured features. 
- Delivery timestamps missing for some orders - document exclusions.

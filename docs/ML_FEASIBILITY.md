# ML_FEASIBILITY.md

## Targets
- Sales/demand forecasting: daily_orders feasible (634 nonzero days, 2016-09 to 2018-10, mean~128, moderate variance). Also daily_revenue feasible.
- Sales prediction (regression): per-order or per-basket revenue feasible with order_items+products+customers+payments features (at prediction time use available info).
- Customer segmentation: RFM-like feasible (orders per customer_unique_id, recency/frequency/monetary) though repeat ratio low (~3.1%).
- Product segmentation: feasible via product/category + aggregated sales/qty.
- Anomaly detection: feasible on aggregated daily series (spikes noted, max 1176 orders).

## Granularity & splits
- Time-series: chronological split (train early, test late). Avoid leakage.
- Regression/clustering: non-time leakage rules; document exclusions.

## Conclusion
Feasible to proceed with lightweight training for baselines+models. No fabrication; evaluate properly.

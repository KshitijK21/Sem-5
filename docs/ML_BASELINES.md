# ML_BASELINES.md

## Daily orders forecast (naive linear with lags)
- Features: lag1, lag7, lag14 (chronological; no leakage)
- Split: 70/30 (chronological), ntrain=532, ntest=228
- MAE: 29.53, RMSE: 39.39
- Note: simple baseline; not production-grade. Honest metrics only.

## Next
- Extend with rolling mean/std, day-of-week; try simple SARIMA/naive if needed.
- Avoid fabricating high accuracy; document limitations.

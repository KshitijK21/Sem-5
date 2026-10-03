## Data Quality Notes

- orders: ~2980 rows have missing delivery/approval timestamps (expected for some statuses). Exclude from avg delivery time when null.
- order_reviews: many comment fields empty (~90k rows with any null in comments) - use review_score only for numeric analysis.
- products: small missing dims (~611 rows) - exclude or impute conservatively; document.
- customers/geolocation/sellers/items/payments mostly complete.
- Preserve raw CSVs in external dir; ETL must not overwrite originals.

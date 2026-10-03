# DATASET PROFILE (draft)
Olist Brazilian E-Commerce Public Dataset - local copy at %USERPROFILE%\Downloads\olist
Files: 9 CSVs. See DATASET_SUMMARY.md for row/col counts and headers.

Key entities:
- customers (customer_id PK, customer_unique_id, location)
- geolocation (zip->lat/lng/city/state)
- orders (order_id PK, customer_id FK->customers, timestamps, status)
- order_items (order_id FK, product_id FK, seller_id FK, price, freight)
- order_payments (order_id FK, payment_type, installments, value)
- order_reviews (order_id FK, scores/timestamps/comments)
- products (product_id PK, category, dims/weight)
- sellers (seller_id PK, location)
- translation (pt->en category)

Notes:
- Historical/static dataset (not live).
- Preserve raw files; ETL must read from external olist dir (never commit raw).
- Relationships: orders<->items/payments/reviews; items<->products/sellers; customers/orders linked by customer_id.
- Dates: purchase/approved/carrier/delivered_customer/estimated; reviews; shipping_limit.
- Data quality: nulls likely in timestamps/delivery dates/review text; need validation.
- Grain: order_items is line-level (important for revenue).
- Avoid assuming profit/margin; use documented revenue definitions (price+freight? typically price per item; total order value from payments or sum of items).
- Repeat customers via customer_unique_id vs customer_id.

Next: add null count, date ranges, distincts per key table.

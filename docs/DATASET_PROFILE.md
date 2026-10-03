# DATASET_PROFILE.md (initial)

## Row/col + nulls (approx counts from inspection)
| File | Rows | Cols | Rows with >=1 empty cell | Notes |
|---|------|------|--------------------------|-------|
| olist_customers_dataset.csv | 99441 | 5 | ~0 | customer_id, customer_unique_id, zip, city, state |
| olist_geolocation_dataset.csv | 1000163 | 5 | ~0 | zip prefix lat/lng/city/state |
| olist_order_items_dataset.csv | 112650 | 7 | ~0 | order_id, item_id, product_id, seller_id, shipping_limit_date, price, freight_value |
| olist_order_payments_dataset.csv | 103886 | 5 | ~0 | order_id, payment_seq, payment_type, installments, payment_value |
| olist_order_reviews_dataset.csv | 99224 | 7 | ~89395 | many nulls in review_comment_title/message; scores present |
| olist_orders_dataset.csv | 99441 | 8 | ~2980 | nulls in approved/delivered timestamps (typical for unfulfilled/late delivery cases) |
| olist_products_dataset.csv | 32951 | 9 | ~611 | some product dims/name length missing in small cases |
| olist_sellers_dataset.csv | 3095 | 4 | ~0 | seller_id, zip, city, state |
| product_category_name_translation.csv | 71 | 2 | ~0 | pt->en mapping |

## Date ranges (from orders)
- order_purchase_timestamp range: 2016-09-04 21:15:19 to 2018-11-12 00:00:00 (historical/static dataset)

## Key observations
- reviews: many comments empty (expected). Focus on review_score for analytics.
- orders: delivery timestamps missing for some orders (order_status context). Handle by documented rules (exclude from avg delivery time where missing).
- products: small missing values in dimensions; exclude or impute conservatively with documentation.
- grain: order_items is line level. Revenue best defined as sum(price) per item; freight_value per item - document assumptions.
- customer_id vs customer_unique_id: customer_id is order-level identifier; customer_unique_id is customer-level. Distinguish for repeat-customer analysis.
- Preserve raw files; ETL reads from external path only.

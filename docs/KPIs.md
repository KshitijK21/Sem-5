# KPIs (verified definitions)
- Total Orders: count distinct order_id from orders (filter by date/status)
- Total Revenue (item-level): sum(order_items.price). Document vs payments sum.
- Avg Order Value: revenue / distinct orders (with exclusions)
- Unique Customers: count distinct customer_unique_id
- Products Sold: sum(order_items.order_item_id count or qty? order_item_id line-level; treat as units)
- Active Sellers: distinct seller_id with orders in period
- Avg Review Score: avg(review_score) where present
- Avg Delivery Time (days): (delivered_customer - purchase) in days; exclude nulls

All computed from Olist; no profit/margin unless derived.

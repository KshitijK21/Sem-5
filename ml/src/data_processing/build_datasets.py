"""Build analysis-ready datasets for ML from the raw Olist CSVs.

Outputs (ml/data/processed/, gitignored):
- daily_series.csv     : date, orders, revenue, avg_order_value
- orders_features.csv  : order-level regression features + target (item_revenue)
- customer_rfm.csv     : customer-level RFM features
- product_features.csv : product-level aggregate features

The raw CSVs are never modified.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from src.common.paths import olist_dir, processed_dir  # noqa: E402


def _read(name: str) -> pd.DataFrame:
    return pd.read_csv(olist_dir() / name)


def build_daily_series(orders: pd.DataFrame) -> pd.DataFrame:
    o = orders.copy()
    o["ts"] = pd.to_datetime(o["order_purchase_timestamp"], errors="coerce")
    o = o.dropna(subset=["ts"])
    daily = o.set_index("ts").resample("D").size().rename("orders").to_frame()
    return daily.reset_index().rename(columns={"ts": "date"})


def build_daily_series_with_revenue(
    orders: pd.DataFrame, items: pd.DataFrame
) -> pd.DataFrame:
    rev = items.groupby("order_id")["price"].sum().rename("revenue")
    o = orders.copy()
    o["ts"] = pd.to_datetime(o["order_purchase_timestamp"], errors="coerce")
    o = o.dropna(subset=["ts"]).merge(rev, on="order_id", how="left")
    o["revenue"] = o["revenue"].fillna(0.0)
    o["date"] = o["ts"].dt.normalize()
    daily = (
        o.groupby("date")
        .agg(orders=("order_id", "nunique"), revenue=("revenue", "sum"))
        .reset_index()
    )
    if not daily.empty:
        min_date = daily["date"].min()
        max_date = daily["date"].max()
        all_dates = pd.date_range(min_date, max_date, freq="D")
        daily = daily.set_index("date").reindex(all_dates).fillna({"orders": 0, "revenue": 0.0}).reset_index()
        daily = daily.rename(columns={"index": "date"})
    
    daily["avg_order_value"] = np.where(
        daily["orders"] > 0, daily["revenue"] / daily["orders"], 0.0
    )
    return daily


def build_orders_features(
    orders: pd.DataFrame, items: pd.DataFrame, customers: pd.DataFrame, products: pd.DataFrame
) -> pd.DataFrame:
    o = orders.copy()
    o["ts"] = pd.to_datetime(o["order_purchase_timestamp"], errors="coerce")
    o = o.dropna(subset=["ts"])
    o["purchase_month"] = o["ts"].dt.month
    o["purchase_weekday"] = o["ts"].dt.weekday
    o["purchase_hour"] = o["ts"].dt.hour

    # target: order item revenue
    rev = items.groupby("order_id").agg(
        item_revenue=("price", "sum"),
        n_items=("order_item_id", "count"),
    )
    base = o.merge(rev, on="order_id", how="inner")
    base = base.merge(customers[["customer_id", "customer_state"]], on="customer_id", how="left")

    # dominant category per order (first item category)
    first_item = (
        items.merge(products[["product_id", "product_category_name"]], on="product_id", how="left")
        .sort_values(["order_id", "order_item_id"])
        .groupby("order_id")
        .first()[["product_category_name"]]
    )
    base = base.merge(first_item, on="order_id", how="left")

    out = base[
        [
            "order_id",
            "purchase_month",
            "purchase_weekday",
            "purchase_hour",
            "customer_state",
            "n_items",
            "product_category_name",
            "item_revenue",
        ]
    ].copy()
    out = out.dropna(subset=["item_revenue"])
    return out


def build_customer_rfm(
    orders: pd.DataFrame, items: pd.DataFrame, customers: pd.DataFrame
) -> pd.DataFrame:
    o = orders.copy()
    o["ts"] = pd.to_datetime(o["order_purchase_timestamp"], errors="coerce")
    o = o.dropna(subset=["ts"])
    o = o.merge(customers[["customer_id", "customer_unique_id"]], on="customer_id", how="left")

    rev = items.groupby("order_id")["price"].sum().rename("order_revenue")
    o = o.merge(rev, on="order_id", how="left")
    o["order_revenue"] = o["order_revenue"].fillna(0.0)

    snapshot = o["ts"].max() + pd.Timedelta(days=1)
    rfm = o.groupby("customer_unique_id").agg(
        last_purchase=("ts", "max"),
        frequency=("order_id", "nunique"),
        monetary=("order_revenue", "sum"),
    )
    rfm["recency_days"] = (snapshot - rfm["last_purchase"]).dt.days
    return rfm.reset_index()[
        ["customer_unique_id", "recency_days", "frequency", "monetary"]
    ]


def build_product_features(
    items: pd.DataFrame, products: pd.DataFrame
) -> pd.DataFrame:
    agg = items.groupby("product_id").agg(
        total_qty=("order_item_id", "count"),
        total_revenue=("price", "sum"),
        avg_price=("price", "mean"),
    )
    prod = products[["product_id", "product_category_name", "product_weight_g"]].copy()
    out = agg.merge(prod, on="product_id", how="left")
    return out.reset_index(drop=True)


def main() -> None:
    out = processed_dir()
    orders = _read("olist_orders_dataset.csv")
    items = _read("olist_order_items_dataset.csv")
    customers = _read("olist_customers_dataset.csv")
    products = _read("olist_products_dataset.csv")

    daily = build_daily_series_with_revenue(orders, items)
    daily.to_csv(out / "daily_series.csv", index=False)

    orders_feat = build_orders_features(orders, items, customers, products)
    orders_feat.to_csv(out / "orders_features.csv", index=False)

    rfm = build_customer_rfm(orders, items, customers)
    rfm.to_csv(out / "customer_rfm.csv", index=False)

    prod_feat = build_product_features(items, products)
    prod_feat.to_csv(out / "product_features.csv", index=False)

    print(f"daily_series: {daily.shape}")
    print(f"orders_features: {orders_feat.shape}")
    print(f"customer_rfm: {rfm.shape}")
    print(f"product_features: {prod_feat.shape}")


if __name__ == "__main__":
    main()

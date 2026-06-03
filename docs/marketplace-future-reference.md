# 🛒 Rural Commerce & Marketplace — Future Reference

**Status: BOOKMARKED — Do not implement yet.**  
Review when upgrading `/global` marketplace to a full commerce engine.

---

## Repositories

| Repo | URL | Best for |
|---|---|---|
| **MedusaJS** | https://github.com/medusajs/medusa | Cart, checkout, orders, product catalog |
| **Saleor** | https://github.com/saleor/saleor | GraphQL API, storefront, multichannel |

---

## What to extract when ready

### From MedusaJS
- **Product & Variant model** → extend `marketplace_products` with variants (size, color, weight)
- **Cart & Order lifecycle** → `PENDING → CONFIRMED → SHIPPED → DELIVERED → REFUNDED`
- **Region/Tax** → support for GST-inclusive pricing for rural sellers
- **Fulfillment providers** → integrate with India Post / Delhivery for rural logistics
- **Discount engine** → SHG group-buy discounts, quantity pricing

### From Saleor
- **Channel concept** → separate storefronts per SHG / federation
- **Warehouse & Stock** → track inventory across multiple SHG storerooms
- **Digital products** → skill certificates, e-learning content delivery
- **Webhooks** → trigger payment confirmation via UPI webhook

---

## Current state of our Marketplace (`/global`)

```
marketplace_products (table)
  - id, shg_id, member_id
  - name, description, category
  - price_per_unit, quantity_available, unit
  - images (JSONB)
  - is_listed, is_featured
```

### What we have now
- ✅ Product listing by SHG members
- ✅ Basic browse + filter by category
- ✅ Featured products
- ✅ Journal entry posted when product is listed (FEES_INCOME)

### What's missing (build with Medusa/Saleor patterns)
- [ ] Cart & order management (`orders`, `order_items` tables)
- [ ] Buyer-side checkout flow
- [ ] Order status tracking (Medusa fulfillment lifecycle)
- [ ] Product variants (size, quantity units)
- [ ] Seller dashboard with sales analytics
- [ ] Razorpay / UPI payment gateway integration
- [ ] Logistics tracking (India Post API)
- [ ] Multi-SHG federation storefronts (Saleor channels)

---

## When to implement

Suggested milestone: **After Phase 2 is stable** (savings + loans + meetings + surveys + impact reporting all live in production with real SHG data).

Trigger: When first SHG reaches 20+ products listed, start the marketplace upgrade sprint.

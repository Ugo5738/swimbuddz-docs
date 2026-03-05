# Store Layer Documentation

Documentation for the **Store** - E-commerce platform for swim gear and merchandise.

---

## Overview

The Store provides e-commerce functionality for selling swimming equipment, apparel, and SwimBuddz merchandise. Members can browse products, manage carts, place orders, and track deliveries.

### Key Characteristics

- **E-Commerce Platform** - Full product catalog, cart, checkout, orders
- **Product Variants** - Size, color, and attribute management
- **Inventory Tracking** - Stock levels and availability
- **Order Management** - Order lifecycle from cart to delivery
- **Member Integration** - Purchase history, saved addresses, wishlists

---

## Related Services

| Service                    | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| **Store Service**          | Products, cart, orders, inventory management |
| **Payments Service**       | Order payments, Paystack integration         |
| **Members Service**        | Customer profiles, shipping addresses        |
| **Communications Service** | Order confirmations, shipping notifications  |
| **Media Service**          | Product images and galleries                 |

---

## Documentation Files

### Architecture & Operations

- **[STORE_ARCHITECTURE.md](./STORE_ARCHITECTURE.md)** - Store design and data model
- **[STORE_OPERATIONS.md](./STORE_OPERATIONS.md)** - Operational workflows
- **[STORE_FRONTEND.md](./STORE_FRONTEND.md)** - Frontend implementation guide
- **[SUPPLIER_SYSTEM.md](./SUPPLIER_SYSTEM.md)** - Supplier management, marketplace phases, commission model

---

## Implementation Status

**⚠️ Minimal Implementation — Supplier System Planned:**

The Store service has extensive models but minimal routes implemented. The supplier system has been designed across all three phases — see [SUPPLIER_SYSTEM.md](./SUPPLIER_SYSTEM.md).

### Implemented ✅

- Comprehensive data models (products, variants, cart, orders)
- Basic product browsing endpoints
- Cart model and relationships
- Order model and status tracking
- Supplier system architecture (3-phase design documented)

### In Progress 🔲

- Supplier model (`store_suppliers` table)
- `supplier_id` and `cost_price_ngn` on Product model
- Expanded `SourcingType` enum (dropship, consignment)

### Gaps (Not Implemented) ⚠️

- Cart management API endpoints
- Checkout workflow
- Order processing
- Inventory management endpoints
- Product variant management
- Admin product creation UI
- Member order history UI
- Paystack payment integration for store
- Supplier CRUD admin endpoints (Phase 2)
- Commission tracking and payouts (Phase 2)

See [STORE_ARCHITECTURE.md](./STORE_ARCHITECTURE.md) and [SUPPLIER_SYSTEM.md](./SUPPLIER_SYSTEM.md) for details.

---

## Core Concepts

### Products

Products are items available for purchase.

**Key Fields:**

- Name, slug, description
- Price (base price)
- Category (apparel, equipment, accessories)
- Brand, SKU
- Images
- Active status

### Product Variants

Variants represent different options for a product (size, color, etc.).

**Example:**

- Product: "SwimBuddz T-Shirt"
- Variants:
  - Small / Blue
  - Medium / Blue
  - Large / Red
  - etc.

**Key Fields:**

- Product ID
- Variant attributes (size, color)
- SKU
- Price override (if different from base)
- Stock quantity
- Active status

### Cart

Shopping cart for members.

**Key Fields:**

- Member ID
- Status (active, abandoned, converted)
- Items (cart items with product variants and quantities)
- Subtotal, total

### Orders

Completed purchases.

**Status Lifecycle:**

- `PENDING` - Order created, awaiting payment
- `PAID` - Payment confirmed
- `PROCESSING` - Being prepared for shipment
- `SHIPPED` - In transit
- `DELIVERED` - Completed
- `CANCELLED` - Cancelled before shipment
- `REFUNDED` - Payment refunded

**Key Fields:**

- Order number
- Member ID
- Items (order items snapshot)
- Subtotal, shipping, total
- Shipping address
- Payment status
- Tracking number

---

## Frontend Routes

### Public Routes

- `/store` - Store homepage, featured products
- `/store/products` - Product catalog
- `/store/products/[slug]` - Product details

### Member Routes

- `/store/cart` - Shopping cart
- `/store/checkout` - Checkout flow
- `/store/orders` - Order history
- `/store/orders/[id]` - Order details and tracking

### Admin Routes

- `/admin/store/products` - Manage products
- `/admin/store/products/create` - Create product
- `/admin/store/products/[id]` - Edit product
- `/admin/store/inventory` - Inventory management (planned)
- `/admin/store/orders` - All orders dashboard
- `/admin/store/orders/[id]` - Order management

---

## API Endpoints

See [API_ENDPOINTS.md](../../swimbuddz-backend/API_ENDPOINTS.md#12-store-minimal-routes) for API reference.

**Current Endpoints (Minimal):**

- `GET /api/v1/store/products` - List products
- `GET /api/v1/store/products/{slug}` - Product details
- Basic product browsing only

**Needed Endpoints:**

- Cart: GET, POST, PUT, DELETE
- Checkout: POST
- Orders: GET (list), GET (detail), POST
- Inventory: PATCH (update stock)
- Product management: POST, PUT, DELETE

---

## User Flows

### Shopping Flow (Member)

1. Browse products at `/store` or `/store/products`
2. Click product → `/store/products/[slug]`
3. Select variant (size, color)
4. Add to cart
5. View cart → `/store/cart`
6. Proceed to checkout → `/store/checkout`
7. Enter delivery info
8. Make payment
9. View order confirmation → `/store/orders/[id]`

See [UI_FLOWS.md](../../swimbuddz-frontend/UI_FLOWS.md#7-member--browse--purchase-store-items) for detailed flow.

### Order Management Flow (Admin)

1. View orders dashboard → `/admin/store/orders`
2. Click order → `/admin/store/orders/[id]`
3. Update order status (processing, shipped)
4. Add tracking number
5. Mark as delivered

### Inventory Management Flow (Admin)

1. View inventory → `/admin/store/inventory`
2. Select product/variant
3. Update stock levels
4. Set low-stock alerts
5. Mark as out of stock or discontinue

---

## Database Models

### Core Tables

**Suppliers:**

- `store_suppliers` - Supplier profiles (SwimBuddz is Supplier #001)

**Products & Inventory:**

- `store_products` - Product catalog (with `supplier_id` FK, `cost_price_ngn`)
- `store_product_variants` - Size/color/attribute combinations
- `store_categories` - Product categorization
- `store_product_images` - Product photos
- `store_inventory_items` - Stock tracking

**Shopping:**

- `store_carts` - Shopping carts
- `store_cart_items` - Items in cart

**Orders:**

- `store_orders` - Completed purchases
- `store_order_items` - Items in order (snapshot)
- `store_pickup_locations` - Pickup points

**Financial:**

- `store_credits` - Store credits for refunds
- `store_supplier_payouts` - Supplier payout records (Phase 2)

See [STORE_ARCHITECTURE.md](./STORE_ARCHITECTURE.md) and [SUPPLIER_SYSTEM.md](./SUPPLIER_SYSTEM.md) for complete schema.

---

## Integration Points

### Payments Service

Store orders create payment intents:

- Order created → Payment intent created
- Payment confirmed → Order status updated to PAID
- Payment failed → Order remains PENDING

### Communications Service

Order status triggers notifications:

- Order placed → Confirmation email
- Order shipped → Shipping notification with tracking
- Order delivered → Delivery confirmation

### Members Service

Store integrates with member profiles:

- Saved shipping addresses
- Purchase history
- Wishlist (planned)
- Loyalty points (planned)

---

## Completion Roadmap

### Phase 1: First-Party Store (Current)

- [ ] Add Supplier model and seed SwimBuddz as Supplier #001
- [ ] Add `supplier_id` and `cost_price_ngn` to Product model
- [ ] Cart management endpoints (add, update, remove items)
- [ ] Checkout workflow (pickup/delivery, Bubbles/Paystack)
- [ ] Order creation and tracking
- [ ] Member order history UI
- [ ] Admin product creation UI
- [ ] Source 3-5 real products
- [ ] Soft launch to existing members

### Phase 2: Vetted Supplier Partners

- [ ] Supplier CRUD admin endpoints and UI
- [ ] Supplier-scoped product/order views
- [ ] Commission tracking per order
- [ ] Payout tracking and management
- [ ] Onboard first external supplier

### Phase 3: Advanced Features

- [ ] Supplier self-service portal
- [ ] Product variant management UI
- [ ] Low-stock alerts
- [ ] Discount codes and promotions

See [SUPPLIER_SYSTEM.md](./SUPPLIER_SYSTEM.md) for full phase details and transition conditions.

---

## Related Documentation

- **[STORE_ARCHITECTURE.md](./STORE_ARCHITECTURE.md)** - Complete architecture and data models
- **[STORE_OPERATIONS.md](./STORE_OPERATIONS.md)** - Operational workflows
- **[STORE_FRONTEND.md](./STORE_FRONTEND.md)** - Frontend implementation
- **[SUPPLIER_SYSTEM.md](./SUPPLIER_SYSTEM.md)** - Supplier management, marketplace phases, commission model
- [SERVICE_REGISTRY.md](../reference/SERVICE_REGISTRY.md) - Store service overview

---

_Last updated: February 2026_

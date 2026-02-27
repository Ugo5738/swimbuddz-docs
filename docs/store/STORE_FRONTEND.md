# SwimBuddz Store Frontend - Implementation Plan

## Overview

Store pages for browsing, cart, checkout, and order management, plus admin pages for product/inventory management.

---

## Page Structure

### Public Store Pages (`/store/*`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/store` | `StorePage` | Featured products, categories, collections |
| `/store/category/[slug]` | `CategoryPage` | Products filtered by category |
| `/store/collection/[slug]` | `CollectionPage` | Curated product listing |
| `/store/product/[slug]` | `ProductDetailPage` | Images, variants, sizing, add to cart |
| `/store/cart` | `CartPage` | Cart summary, discount code, proceed to checkout |
| `/store/checkout` | `StoreCheckoutPage` | Fulfillment selection, payment |

### Member Order Pages (`/account/*`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/account/orders` | `OrderHistoryPage` | List of past orders |
| `/account/orders/[number]` | `OrderDetailPage` | Order details, status tracking |

### Admin Store Pages (`/admin/store/*`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/store` | `StoreDashboard` | Stats, recent orders, low stock alerts |
| `/admin/store/products` | `ProductListPage` | All products with filters |
| `/admin/store/products/new` | `ProductFormPage` | Create product |
| `/admin/store/products/[id]` | `ProductFormPage` | Edit product, variants, images |
| `/admin/store/categories` | `CategoriesPage` | Category tree management |
| `/admin/store/inventory` | `InventoryPage` | Stock levels, restock |
| `/admin/store/orders` | `AdminOrdersPage` | All orders, status updates |
| `/admin/store/orders/[id]` | `AdminOrderDetailPage` | Order detail, fulfill, refund |
| `/admin/store/pickup-locations` | `PickupLocationsPage` | Manage pickup locations |

---

## Key Components

### Product Display
- `ProductCard` - Grid item with image, price, quick-add
- `ProductGallery` - Image carousel with zoom
- `VariantSelector` - Size/color picker
- `PriceDisplay` - Shows price, member discount badge
- `StockBadge` - In stock / Low stock / Pre-order

### Cart
- `CartDrawer` - Slide-out mini cart
- `CartItemRow` - Line item with quantity controls
- `CartSummary` - Subtotal, discounts, total
- `DiscountCodeInput` - Apply/remove discount

### Checkout
- `FulfillmentSelector` - Pickup vs Delivery
- `PickupLocationPicker` - Select pool location
- `DeliveryAddressForm` - Address fields
- `StoreCreditSelector` - Apply available credits

### Admin
- `ProductForm` - Full product editor
- `VariantTable` - Manage variants inline
- `InventoryAdjustModal` - Stock adjustment
- `OrderStatusStepper` - Visual order flow
- `RefundModal` - Issue store credit

---

## State Management

### Cart Context (`StoreCartContext`)

```typescript
interface StoreCartState {
  cart: Cart | null;
  loading: boolean;
  addItem: (variantId: string, qty: number) => Promise<void>;
  updateItem: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  clearCart: () => void;
}
```

Cart persists via:
- **Logged in**: `member_auth_id` → server-side cart
- **Guest**: `localStorage` session ID → server-side cart

### API Pattern

Use existing `apiGet`/`apiPost` from `@/lib/api`:

```typescript
// Get products
const products = await apiGet<ProductListResponse>('/api/v1/store/products', { 
  params: { category: slug, page: 1 } 
});

// Add to cart
await apiPost('/api/v1/store/cart/items', { variant_id, quantity }, { auth: optional });
```

---

## Implementation Order

| # | Task | Est. | Files |
|---|------|------|-------|
| 1 | Store layout + cart context | 2h | `(public)/store/layout.tsx`, `lib/storeCart.tsx` |
| 2 | Product listing page | 3h | `(public)/store/page.tsx`, `ProductCard.tsx` |
| 3 | Product detail page | 4h | `(public)/store/product/[slug]/page.tsx` |
| 4 | Cart page | 3h | `(public)/store/cart/page.tsx` |
| 5 | Store checkout page | 4h | `(public)/store/checkout/page.tsx` |
| 6 | Order history (member) | 2h | `(member)/account/orders/page.tsx` |
| 7 | Admin products list | 3h | `(admin)/admin/store/products/page.tsx` |
| 8 | Admin product form | 4h | `(admin)/admin/store/products/[id]/page.tsx` |
| 9 | Admin orders | 3h | `(admin)/admin/store/orders/page.tsx` |
| 10 | Admin inventory | 2h | `(admin)/admin/store/inventory/page.tsx` |

**Total: ~30 hours**

---

## UX Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Cart persistence | Server-side with session | Survives refresh, merges on login |
| Guest checkout | Login required | Need tier for member discount |
| Product images | Gallery with thumbnails | Swimwear needs multiple angles |
| Size selection | Visual buttons, not dropdown | Faster selection, shows availability |
| Checkout flow | Single page | Pool pickup keeps it simple |
| Mobile cart | Slide-out drawer | Don't leave the page |

---

## API Integration

All store APIs via gateway:

```
GET  /api/v1/store/categories
GET  /api/v1/store/products?category=&search=&page=
GET  /api/v1/store/products/{slug}
POST /api/v1/store/cart
GET  /api/v1/store/cart
POST /api/v1/store/cart/items
PATCH /api/v1/store/cart/items/{id}
DELETE /api/v1/store/cart/items/{id}
POST /api/v1/store/checkout/start
GET  /api/v1/store/orders
GET  /api/v1/store/orders/{number}
```

---

## Next Action

Start with **Task 1: Store layout + cart context** to establish foundation for all store pages.

# Ek Hi Backend – App + Web

## Flow

```
                    ┌─────────────────────────────────────┐
                    │         BACKEND (Port 5000)           │
                    │  Express + MongoDB                    │
                    │  /api/products     (list, single)     │
                    │  /api/admin/products (CRUD, bulk)     │
                    └──────────────┬───────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│   APP (Farmaa)       │ │   APP ADMIN PANEL     │ │   WEB (furrmaa-web)   │
│   User side          │ │   Product Management  │ │   Shop, Cart, etc.    │
│                      │ │                      │ │                       │
│ • Products list      │ │ • List products      │ │ • Shop → GET /api/    │
│   GET /api/products  │ │   GET /api/admin/    │ │   products            │
│ • Product detail     │ │   products           │ │ • Product detail      │
│ • Cart, Orders       │ │ • Add product        │ │ • Cart (local state)  │
│ • etc.               │ │   POST /api/admin/   │ │ • Cremation, FAQ      │
│                      │ │   products           │ │   → same backend      │
│   api.js → same      │ │ • Edit product       │ │   .env: NEXT_         │
│   base URL           │ │   PUT /api/admin/    │ │   PUBLIC_API_URL=     │
│   (PC IP:5000/api)   │ │   products/:id       │ │   http://localhost:    │
│                      │ │ • Delete product     │ │   5000/api             │
│                      │ │   DELETE /api/admin/ │ │                       │
│                      │ │   products/:id       │ │                       │
│                      │ │ • Bulk upload        │ │                       │
│                      │ │   POST /api/admin/    │ │                       │
│                      │ │   products/bulk-     │ │                       │
│                      │ │   upload             │ │                       │
│                      │ │                      │ │                       │
│   Same api.js        │ │   Same api.js        │ │   fetch() to same     │
│   BASE_URL           │ │   BASE_URL           │ │   backend URL         │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

## Kahan kya use ho raha hai

| Cheez | Backend route | App / Web |
|-------|----------------|-----------|
| Products list (user) | `GET /api/products` | App: ProductsScreen, Web: Shop, Home sections |
| Product detail | `GET /api/products/:id` | App: ProductDetailScreen, Web: product_details page |
| Admin – list products | `GET /api/admin/products` | App: AdminProductsScreen |
| Admin – add product | `POST /api/admin/products` | App: ProductFormScreen (Add) |
| Admin – edit product | `PUT /api/admin/products/:id` | App: ProductFormScreen (Edit) |
| Admin – delete product | `DELETE /api/admin/products/:id` | App: AdminProductsScreen |
| Admin – bulk upload | `POST /api/admin/products/bulk-upload` | Backend ready; app opens web admin / template |

## Summary

- **Ek hi backend** – sab data yahi se aa raha hai.
- **App admin panel (product management)** – list, add, edit, delete sab **isi backend** pe hai (`/api/admin/products`).
- **Web** – shop, product detail, cremation, FAQ bhi **isi backend** se (`NEXT_PUBLIC_API_URL` = `http://localhost:5000/api`).
- **App** – `Farmaa/src/config/api.js` mein `BASE_URL` = PC ka IP:5000/api (device) ya localhost:5000/api (emulator).

Admin panel se jo product add/edit/delete karoge, wahi data app aur web dono mein dikhega kyunki dono same backend use kar rahe hain.

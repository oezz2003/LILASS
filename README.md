# coffee

## Backend Quickstart

1) Create `.env` in project root:

```
MONGO_URI=mongodb://localhost:27017/coffee
MONGO_DB_NAME=coffee
JWT_SECRET=super-secret-jwt
STRIPE_SECRET_KEY=sk_test_xxx   # optional
PING_MESSAGE=ping
```

2) Install and seed:

```bash
pnpm install
pnpm seed
```

3) Run API dev server:

```bash
pnpm dev:api
```

## API endpoints

- POST `/api/auth/register` → `{ name, email, password, role? }` → `{ user, token }`
- POST `/api/auth/login` → `{ email, password }` → `{ user, token }`
- GET `/api/products` → `{ products: Product[] }`
- POST `/api/orders` (Bearer token) → `{ items: [{ productId, variantId, quantity }], customerEmail, shippingAddress?, billingAddress? }` → `{ order }`
- POST `/api/payments` (Bearer token) → `{ provider: 'stripe'|'paypal'|'manual', amount, currency?, orderId? }` → `{ payment, clientSecret? }`

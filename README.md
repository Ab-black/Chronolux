# ChronoLux

ChronoLux is a luxury watch e-commerce website built with HTML, CSS and vanilla JavaScript, with Supabase providing the backend/data layer, authentication, database functions and Edge Functions. Flutterwave handles the current payment flow.

## 1. Project Overview

ChronoLux is a static front-end application hosted on GitHub Pages.

### Main customer pages

- `index.html` — homepage and featured watches
- `collection.html` — product catalog, search, filtering and sorting
- `product.html` — individual watch details
- `cart.html` — Local Storage shopping cart
- `checkout.html` — customer details, shipping calculation and payment initialization
- `confirmation.html` — payment verification and order confirmation
- `about.html` — company information
- `contact.html` — contact form / WhatsApp enquiry
- `reviews.html` — customer reviews

### Admin

- `admin.html` — protected admin dashboard
- `js/admin.js` — admin dashboard behaviour
- `js/admin-orders.js` — order management UI

## 2. Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Supabase
  - PostgreSQL database
  - Authentication
  - RPC/database functions
  - Edge Functions
- Flutterwave — payment initialization and verification
- Resend — order confirmation email delivery
- GitHub Pages — static website hosting
- Browser Local Storage — cart persistence
- Browser Session Storage — checkout session state

No Node.js build process is required for the front-end.

## 3. Repository Structure

```
/
├── index.html
├── collection.html
├── product.html
├── cart.html
├── checkout.html
├── confirmation.html
├── about.html
├── contact.html
├── reviews.html
├── admin.html
├── css/
│   ├── style.css
│   ├── responsive.css
│   ├── admin.css
│   └── admin-mobile.css
└── js/
    ├── supabase.js
    ├── script.js
    ├── collection.js
    ├── product.js
    ├── cart.js
    ├── checkout.js
    ├── confirmation.js
    ├── contact.js
    ├── home-featured.js
    ├── admin.js
    └── admin-orders.js
```

The Supabase Edge Functions used by production are deployed in the Supabase project rather than stored as front-end JavaScript in this repository.

## 4. Supabase Project

Production Supabase project:

- Project ID: `jikupeerqizcthwargvi`
- Project URL: `https://jikupeerqizcthwargvi.supabase.co`

The browser uses a Supabase **publishable** key through `js/supabase.js`. This is intentionally different from server-side secret credentials.

**Never place `SUPABASE_SERVICE_ROLE_KEY`, Flutterwave secret keys, Resend API keys or other server secrets in browser code or GitHub.**

## 5. Environment Variables / Secrets

### Front-end

The current front-end is a static GitHub Pages site and does not use a build-time `.env` file.

The Supabase project URL and publishable key are currently configured in:

`js/supabase.js`

The publishable key is suitable for browser use when the database/API access model is secured correctly. It must not be replaced with a Supabase secret/service-role key.

### Supabase Edge Functions

Supabase automatically provides `SUPABASE_URL` and the project's built-in Supabase credentials to Edge Functions. The production functions in this project also rely on these configured secrets:

| Variable | Used for |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-side Supabase operations |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave payment initialization/verification |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Flutterwave webhook signature validation |
| `RESEND_API_KEY` | Sending order confirmation emails |
| `CHRONOLUX_FROM_EMAIL` | Optional sender address for order emails |

`CHRONOLUX_FROM_EMAIL` defaults to `ChronoLux <orders@chronolux.com>` in the current email function if it is not configured.

Store these values in **Supabase Edge Function Secrets**, not in the repository. Supabase documents production secrets and environment handling here: https://supabase.com/docs/guides/functions/secrets

## 6. Production Edge Functions

The current Supabase project has these active functions relevant to the application:

### Payments

- `flutterwave-initialize`
- `flutterwave-verify`
- `flutterwave-webhook`

The browser never receives the Flutterwave secret key. The Edge Functions read the secret server-side.

### Shipping

- `shipping-countries`
- `shipping-quote`

Shipping prices are calculated using server-side data/functions rather than trusting a price supplied by the browser.

### Order confirmation

- `send-order-confirmation`

This uses Resend to send the customer confirmation email after successful payment/order confirmation.

### Administration

- `admin-orders`
- `admin-shipping`

Admin order access is authenticated and checks the `admin_users` table before allowing order management operations.

## 7. Database / Order Architecture

The main product and order data lives in Supabase PostgreSQL.

Important tables include:

- `watches` — product catalog
- `orders` — order/customer/payment/shipping records
- `order_items` — individual items in cart orders
- `admin_users` — admin authorization
- shipping configuration tables for countries, states, zones and rates
- review-related tables used by the review system

### Single-product purchase

```
Product
  ↓
Checkout
  ↓
create_chronolux_order()
  ↓
Server reads authoritative watch price
  ↓
Server calculates shipping and total
  ↓
orders
  ↓
flutterwave-initialize
  ↓
Flutterwave
  ↓
flutterwave-verify
  ↓
Confirmed order
```

### Cart purchase

```
Product cards
  ↓
Local Storage (chronolux-cart)
  ↓
Cart
  ↓
Checkout
  ↓
create_chronolux_cart_order()
  ↓
Server reads authoritative prices for every watch
  ↓
Server calculates subtotal + shipping + total
  ↓
orders + order_items
  ↓
flutterwave-initialize
  ↓
Flutterwave
  ↓
flutterwave-verify
  ↓
Confirmed order
  ↓
Cart cleared after verified payment
```

The browser is not trusted for final product prices, shipping prices or order totals.

## 8. Local Development

Because the front-end is static, it can be opened with a local HTTP server.

For example, with Python installed:

```bash
python -m http.server 8000
```

Then open:

```
http://localhost:8000
```

Using a local HTTP server is preferable to opening HTML files directly with `file://`, because the site uses JavaScript modules/services, browser storage and remote APIs.

### Supabase Edge Functions

If the Edge Function source is available locally, install the current Supabase CLI and authenticate:

```bash
supabase login
supabase link --project-ref jikupeerqizcthwargvi
```

For local Edge Function development, Supabase uses `supabase/functions/.env` for local secrets. Do not commit that file.

Typical local workflow:

```bash
supabase start
supabase functions serve <function-name>
```

Supabase documents the current Edge Function workflow here: https://supabase.com/docs/guides/functions/quickstart

## 9. Deployment

### Front-end — GitHub Pages

The production front-end is deployed from the repository's `main` branch.

In GitHub:

1. Open the `Ab-black/Chronolux` repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select:
   - Branch: `main`
   - Folder: `/(root)`
5. Save.

After changes are pushed to the publishing branch, GitHub Pages publishes the updated static files.

GitHub's current Pages documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-github-pages

### Supabase Edge Functions

After authenticating and linking the Supabase CLI:

```bash
supabase functions deploy <function-name>
```

To deploy all locally available functions:

```bash
supabase functions deploy
```

Set production secrets separately in Supabase before testing payment/email functionality.

Supabase deployment documentation: https://supabase.com/docs/guides/functions/deploy

## 10. Payment Flow

The current payment provider is Flutterwave.

Important rules:

1. The browser creates/references an order through the existing Supabase order flow.
2. The server reads the authoritative order amount from the database.
3. Flutterwave initialization is performed by the `flutterwave-initialize` Edge Function.
4. The customer completes payment on Flutterwave.
5. `flutterwave-verify` verifies the transaction against the stored order.
6. Verification checks payment status, amount, currency, transaction reference and transaction ID.
7. The order is marked paid/confirmed only after those checks succeed.
8. The webhook provides an additional server-side payment notification path.

Do not move the Flutterwave secret key into front-end JavaScript.

## 11. Shopping Cart

The cart is intentionally client-side for the shopping-selection stage.

Storage key:

```
chronolux-cart
```

The cart stores product identifiers and quantities in Local Storage.

The server does **not** trust client-side prices. During order creation, Supabase reads the current product prices from `watches.new_price` and calculates the final order amount server-side.

## 12. Authentication and Admin Access

Customer authentication is handled through Supabase Auth.

The admin dashboard is protected separately. The `admin-orders` Edge Function:

1. Requires an authenticated bearer token.
2. Resolves the Supabase user.
3. Checks `admin_users`.
4. Requires an active user with the `admin` role.
5. Only then allows order listing, detail viewing or status updates.

Admin order statuses currently supported:

- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

## 13. Before Handing the Project to Another Developer

Give the developer access to both:

1. The GitHub repository.
2. The Supabase project.

They will need the Supabase project access to maintain the database, Auth configuration, RPC functions, Edge Functions and production secrets.

They should **not** receive secrets by putting them into this README or committing them to GitHub.

Before making production changes, verify:

- GitHub Pages still points to `main`
- Supabase project ID is correct
- production Edge Functions are deployed
- required Supabase secrets exist
- Flutterwave credentials are active
- Resend credentials/domain configuration is active
- admin user exists and is active
- shipping configuration is present
- payment verification works
- order confirmation email works
- mobile and desktop layouts still work

## 14. Important Maintenance Rules

- Do not expose service-role/secret keys in browser files.
- Do not trust browser-supplied product prices or final totals.
- Keep payment verification server-side.
- Keep admin authorization server-side.
- Avoid unrelated changes to the checkout/payment architecture.
- Test both BUY NOW and CART checkout after payment-related changes.
- Test mobile layouts after changes to product cards, cart or checkout.
- Preserve the existing luxury visual design unless a redesign is explicitly requested.

## 15. Current Production Contact Details

- WhatsApp: +234 903 945 0751
- Email: abrahamgift788@gmail.com

---

## Quick Handover Summary

```
GitHub Pages
     │
     ▼
ChronoLux HTML/CSS/JS
     │
     ├── Supabase Auth
     ├── Supabase Database
     ├── Supabase RPC functions
     └── Supabase Edge Functions
             │
             ├── Shipping
             ├── Order creation
             ├── Admin orders
             ├── Flutterwave payment
             └── Resend confirmation email

Browser Local Storage
     │
     └── chronolux-cart
```

The front-end is static, while Supabase provides the server-side functionality required for secure e-commerce operations.

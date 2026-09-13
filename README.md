# Western Avenue — Website

A static multi-page site: storefront, login/signup, cart, checkout, and an admin order view.

## Files

```
index.html      Storefront (hero, products, etc.)
login.html      Sign in
signup.html     Create account
cart.html       View / edit selected items
checkout.html   Shipping + payment details, places the order
admin.html      Order list for the shop owner
assets/css/     Shared stylesheet
assets/js/      Shared cart logic + email-field assist
assets/img/     Logo + storefront photo
```

## Deploying to GitHub Pages

1. Push this whole folder to a GitHub repo.
2. Repo → Settings → Pages → Source: deploy from branch → pick `main` and `/root`.
3. Your site will be live at `https://<username>.github.io/<repo-name>/`.

That's it — this is a static site, so no build step or server is required for the pages themselves to load.

## ⚠️ Important — please read before you rely on this for a real store

This is a fully working **front-end prototype**. A few things about how it works are important to understand
before customers start using it for real:

### 1. Cart, accounts, and orders live in the browser, not a database
Everything (cart contents, signed-up users, placed orders) is stored in the browser's `localStorage`/`sessionStorage`.
That means:
- Each customer's cart only exists on their own device/browser.
- **The admin page only shows orders placed from that same browser.** If a customer orders from their phone and you
  check admin.html on your laptop, you won't see it there — because there's no shared server or database.
- Signup "accounts" aren't secure. Passwords are stored in plain text in the browser. This is fine for demoing the
  UI flow, but you should **never launch this to real customers** without replacing it with real backend authentication
  (e.g. Firebase Auth, Supabase Auth, or your own server with hashed passwords).

To make orders/accounts real and shared across devices, you need a backend — options roughly easiest to hardest:
- **Firebase** or **Supabase** (free tiers, handle auth + database, work well with static front-ends like this one)
- **Shopify / a hosted e-commerce platform** if you'd rather not maintain backend code at all
- A custom server (Node/Express, etc.) with a real database, hosted on something like Render, Railway, or a VPS

### 2. Real order-notification emails need a mail-sending service
GitHub Pages only serves static files — it can't run code that sends email. `checkout.html` is already wired up to use
**EmailJS** (a free service that lets a static page trigger an email from the browser) — you just need to fill in your
own keys:

1. Create a free account at https://www.emailjs.com
2. Add an Email Service (Gmail, Outlook, etc.) → copy the **Service ID**
3. Create an Email Template with variables: `order_id`, `customer_name`, `customer_email`, `customer_phone`,
   `address`, `items`, `total`, `payment` → copy the **Template ID**
4. Copy your **Public Key** from Account → API Keys
5. Open `checkout.html`, find the `EMAILJS_...` constants near the bottom, and paste your three values in, plus your
   real admin email in `ADMIN_NOTIFY_EMAIL`.

Until you do that, orders still save correctly and show up in `admin.html` — they just won't trigger a real email.
(Formspree is a simpler alternative if you'd rather not use EmailJS — it emails you on any form submit with no JS SDK needed.)

### 3. No real payment processing
The payment step on checkout only collects a payment *method choice* — it does not collect or process card numbers,
and nothing is actually charged. Handling real payments safely requires integrating a licensed payment gateway
(Razorpay, Stripe, PayU, etc.) through a proper backend — collecting raw card details on a page without that is both
insecure and against card network rules. Treat the current checkout as a UI you'd connect to a real gateway's
checkout SDK later, not something to take live payments with as-is.

### Demo admin password
`admin.html` is gated behind the password `avenue2024`, hardcoded in the page's JavaScript. Anyone who views the
page source can read it — it's there purely so the admin view isn't wide open by default while you're testing.
Replace this with real authentication before going live.

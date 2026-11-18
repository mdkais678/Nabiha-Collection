# NABIHA COLLECTION
**Elegance in Every Thread.** Premium Pakistani women's fashion storefront and store-management starter.

## Included in this build
- Premium responsive homepage, navigation and footer
- Supabase-backed published-product catalogue and product detail pages
- Variant/size selection and local persistent shopping bag
- Checkout form with COD, bank transfer, Easypaisa and JazzCash choices
- Transactional PostgreSQL order RPC with server-side pricing, row locks, stock decrement and idempotency
- Admin Supabase Auth login gate and role check for `/admin` and `/api/admin/*`
- Admin overview, basic product creation/listing and order status management
- Order tracking by order number + phone (does not expose address)
- WhatsApp Cloud API template-notification adapter and failed-notification retry endpoint
- SQL schema, RLS policies, seeded categories and environment template

## Brand/contact settings
- WhatsApp owner number: `03133316526` (international format `923133316526`)
- Business email: `kaiswebstudio@gmail.com`
- Currency: PKR
- Timezone: Asia/Karachi
- Free delivery threshold in checkout RPC: Rs. 8,000; default shipping fee Rs. 250. Adjust the SQL to your actual courier rates before launch.

## 1. Local setup
1. Install Node.js 20.9 or newer.
2. Extract the ZIP and open the folder in VS Code.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Create a Supabase project and fill the public URL, anon key and service-role key in `.env.local`.
6. In Supabase SQL Editor, run `supabase/migrations/001_initial_schema.sql` once.
7. Run `npm run dev`, then open `http://localhost:3000`.

Never put the Supabase service-role key in a `NEXT_PUBLIC_` variable or commit `.env.local`.

## 2. Create your admin login
1. Supabase Dashboard → Authentication → Users → Add user.
2. Create your private admin email/password.
3. Copy that user's UUID.
4. Supabase SQL Editor: run `insert into public.admin_roles(user_id, role) values ('YOUR-USER-UUID','owner');`
5. Visit `/admin/login` and sign in.
Only users with a row in `admin_roles` can access the admin pages and admin APIs.

## 3. Add products
Open `/admin/products` after signing in. Create a product with name, slug, price and description.
The schema expects at least one product variant (size/stock) before a customer can add it to cart. Add variants in Supabase Table Editor → `product_variants`, using the new product UUID, size, stock quantity and optional SKU. Add image URLs in `product_images`. Upload actual product photos to a Supabase Storage bucket and use the public image URL in `product_images.image_url`.
For a production admin, the remaining product editing, image upload/reordering, category editing and inventory-adjustment screens should be added before handing the dashboard to staff.

## 4. Meta WhatsApp Cloud API setup
1. Create or use a Meta Business Portfolio.
2. Create a Meta developer app and add the WhatsApp product.
3. Set up a WhatsApp Business Account and register/verify the sender phone number in WhatsApp Manager.
4. In WhatsApp → API Setup, obtain the Phone Number ID and a permanent/system-user access token with the required WhatsApp messaging permissions.
5. Create and get approval for a utility message template. The template body must contain five text placeholders, in this order: order number, customer name, phone, city, total amount.
6. Add these server-only values to Vercel and `.env.local`:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID` (kept for reference/configuration)
   - `WHATSAPP_API_VERSION` (example: `v22.0`; use the current version supported by your Meta app)
   - `WHATSAPP_OWNER_NUMBER=923133316526`
   - `WHATSAPP_ORDER_TEMPLATE=your_approved_template_name`
   - `WHATSAPP_TEMPLATE_LANGUAGE=en` (must match the approved template language)
7. Redeploy and place a controlled test order. Check `whatsapp_notifications` for delivery attempt status and errors.
The sender must be registered with WhatsApp Business Platform. A normal `wa.me` link is not Cloud API automation. Do not assume notification delivery until a real Meta API response confirms acceptance; delivery status webhooks are a further enhancement.

## 5. Supabase storage
Create a public bucket such as `product-images` for catalog images, with image MIME-type and file-size restrictions. Keep customer payment proofs in a separate private bucket. Do not make private payment evidence publicly readable.

## 6. Deploy to Vercel
1. Push this folder to a private GitHub repository.
2. Import that repository into Vercel.
3. Add all environment variables from `.env.example` in Vercel Project Settings.
4. Set `NEXT_PUBLIC_SITE_URL` to your actual production URL.
5. Deploy. Re-deploy whenever environment variables change.
6. Test storefront, admin login, product variants, order creation, stock decrement, order tracking and WhatsApp API response.

## Production-readiness notes — read before accepting live customers
This build contains a substantial working foundation, but it is **not yet a fully audited production commerce system**. Specifically:
- Payment methods are recorded as pending; no online gateway or payment screenshot upload/verification UI is integrated.
- Coupon validation, shipping-zone configuration UI, customer accounts, customer-facing wishlist, newsletter, invoice PDF, complete product/image/category CRUD and detailed analytics are not finished.
- The checkout RPC handles current price calculation, stock row locking, stock decrement, order snapshots and idempotency. Test it against your exact Supabase project and stock edge cases before launch.
- Admin route protection uses Supabase Auth plus `admin_roles`. Review RLS policies and run security tests with anon, customer and admin sessions.
- Add rate limiting to public checkout/tracking endpoints and WhatsApp webhook delivery-status handling before a high-volume launch.
- The initial schema is a starter migration. Apply it to a fresh Supabase project; do not blindly rerun it on a database with existing tables.
- Configure Meta approved templates and verify the sender before expecting WhatsApp messages. Configure a payment provider only after selecting it and obtaining credentials.

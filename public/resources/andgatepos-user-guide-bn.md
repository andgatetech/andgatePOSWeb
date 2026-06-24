# AndgatePOS ব্যবহার নির্দেশিকা

ভার্সন: জুন ২০২৬  
কার জন্য: বাংলাদেশি SME ব্যবসার মালিক, দোকান ম্যানেজার, ক্যাশিয়ার, স্টক কর্মী, হিসাব কর্মী এবং ecommerce অপারেটর।

## ১. AndgatePOS কী করে

AndgatePOS হলো বাংলাদেশি SME ব্যবসার জন্য POS এবং Business OS। এতে আছে কাউন্টার বিক্রি, স্টক, ক্রয়, সাপ্লায়ার, কাস্টমার, CRM, ক্যাশ ক্লোজিং, পেটি ক্যাশ, কর্মী হাজিরা, সার্ভিস জব, হিসাব, রিপোর্ট, ecommerce, courier setup, staff role এবং multi-store operation।

![ড্যাশবোর্ড](/assets/LandingImage/updated/dashboard.webp)

## ২. লগইন, স্টোর অ্যাক্সেস ও ভাষা

1. `https://andgatepos.com/login` খুলুন।
2. ইমেইল ও পাসওয়ার্ড দিন।
3. একাধিক স্টোর থাকলে সঠিক স্টোর নির্বাচন করুন।
4. English/Bangla language switcher ব্যবহার করুন।
5. নতুন deploy-এর পর page load না হলে একবার reload করুন। তারপরও stuck থাকলে cache clear করুন বা support-এ যোগাযোগ করুন।

অ্যাক্সেস নিয়ম:

- Owner/admin সাধারণত সব module দেখতে পারেন।
- Staff access role permission অনুযায়ী।
- Cashier: POS, order, customer lookup, cash closing submit।
- Manager: report, cash closing approve, petty cash approve, attendance, stock review।
- Accounts staff: expense, accounting, report, supplier/customer due, cash book।

## ৩. প্রথম সেটআপ চেকলিস্ট

নিয়মিত বিক্রির আগে:

1. Store profile ঠিক করুন।
2. Payment method যোগ করুন: Cash, bKash, Nagad, Rocket, Upay, Card, Bank Transfer।
3. VAT/tax থাকলে সেট করুন।
4. Category ও brand তৈরি করুন।
5. Product যোগ করুন: price, cost, unit, stock, barcode, variant, serial/batch।
6. Supplier যোগ করুন এবং opening due দিন।
7. Customer যোগ করুন এবং opening due থাকলে দিন।
8. Staff user ও role তৈরি করুন।
9. একটি test sale, return, cash closing ও report দেখে নিন।
10. Ecommerce ব্যবহার করলে online product এবং courier credential সেট করুন।

![স্টোর লিস্ট](/assets/LandingImage/updated/store-list.webp)

## ৪. Dashboard

Dashboard-এ দেখবেন:

- আজকের বিক্রি।
- Order count।
- Top products।
- Pending orders।
- Low stock alerts।
- Store switcher।
- Date filter।
- Operational signals।

Daily habit:

1. Sales দেখুন।
2. Low stock দেখুন।
3. Customer due দেখুন।
4. Supplier due দেখুন।
5. Business OS pending task দেখুন।

## ৫. Business OS Command Center

Business OS হলো owner/manager-এর command center। POS checkout-এর সাথে এই কাজগুলো মেশানো ঠিক না, কারণ কিছু কাজ owner/manager করেন, কিছু কাজ employee/cashier করেন।

এখানে থাকে:

- Cash and counter closing।
- Petty cash।
- Staff attendance।
- Service and repair jobs।
- Business task/follow-up।
- Customer due signal।
- Supplier due signal।
- Reorder signal।

Recommended role:

- Owner: full access।
- Manager: Business OS view, cash closing/petty cash approve, attendance view।
- Cashier: cash closing submit।
- Employee: attendance/service update, permission থাকলে।

## ৬. Cash and Counter Closing

Path: `Cash Closing`

দিন/shift শেষে cashier/staff লিখবে:

- Opening cash।
- Cash sales।
- Cash expense।
- Due collection।
- Supplier payment।
- Actual counted cash।
- Note।

System দেখাবে:

- Expected cash।
- Expected ও actual cash difference।

Owner/manager পারবেন:

- Approve।
- Reject।
- Past closing review।

Good practice:

- Submit করার আগে হাতে cash গুনুন।
- bKash/Nagad/card কে physical cash-এর সাথে মেশাবেন না।
- Cash কম/বেশি হলে note দিন।
- POS sales, expense ও due collection মিলিয়ে approve করুন।

## ৭. Petty Cash

Path: `Petty Cash`

ছোট খরচের জন্য ব্যবহার করুন:

- চা।
- Transport।
- Packaging।
- Emergency repair।
- Delivery helper।
- ছোট utility item।

Workflow:

1. Staff title, amount, requester name দিয়ে request করবে।
2. Owner/manager approve বা reject করবে।
3. History থাকবে।

Good practice:

- Petty cash আলাদা রাখুন।
- Title পরিষ্কার লিখুন: "Delivery rickshaw", "Packaging tape"।
- Profit/loss দেখার আগে petty cash review করুন।

## ৮. HR Attendance

Path: `HR > Attendance`

ব্যবহার:

- Staff check-in।
- Staff check-out।
- Late arrival note।
- Early leave note।
- Shift handover note।

Good practice:

- Staff আসার সাথে check-in করবে।
- Salary বা shift plan-এর আগে manager attendance দেখবেন।
- Exception থাকলে note দিন।

## ৯. Service and Repair Jobs

Path: `Service Jobs`

Electronics, mobile, repair, tailoring, after-sales service ধরনের দোকানে দরকার।

Job তৈরি করতে:

- Customer name।
- Item name।
- Problem।
- Due date।
- Status।

Status:

- Received।
- Working।
- Ready।
- Delivered।

Good practice:

- Problem পরিষ্কার লিখুন।
- Realistic due date দিন।
- কাজ এগোলে status বদলান।
- Customer item পেলে delivered দিন।

## ১০. POS Terminal

Path: `POS`

![POS Terminal](/assets/LandingImage/updated/pos.webp)

Workflow:

1. Product search বা barcode scan করুন।
2. Variant/serial দরকার হলে নির্বাচন করুন।
3. Quantity দিন।
4. Discount লাগান, permission থাকলে।
5. Customer select করুন, due/loyalty/history দরকার হলে।
6. Payment নিন।
7. Invoice print/save করুন।

Payment:

- Full cash।
- bKash/Nagad/Rocket/Upay।
- Card।
- Bank transfer।
- Split payment।
- Partial payment/customer due।

Offline POS:

- Internet unstable হলেও offline mode enabled থাকলে sale চালানো যায়।
- Internet ফিরে এলে order sync হবে।
- Sync শেষ হওয়ার আগে browser বন্ধ করবেন না।

## ১১. Orders, Invoice, Returns, Coupons

Path: `Orders`

![Orders](/assets/LandingImage/updated/orders.webp)

Orders থেকে:

- Sales history দেখুন।
- Invoice print করুন।
- Payment status দেখুন।
- Return শুরু করুন।
- Customer/order detail দেখুন।

Return workflow:

1. Order খুলুন।
2. Return item select করুন।
3. Return reason দিন।
4. Stock-এ ফেরত যাবে কি না ঠিক করুন।
5. Refund/adjustment করুন।

Coupons:

- Coupon code তৈরি।
- Discount set।
- POS/order-এ apply।
- Report-এ discount effect দেখুন।

## ১২. Products, Categories, Brands, Variants, Labels

Clean product setup না থাকলে POS ও stock দুটোই ভুল হবে।

![Product List](/assets/LandingImage/updated/products.webp)

Recommended order:

1. Category তৈরি।
2. Brand তৈরি।
3. Unit/warranty default সেট।
4. Product যোগ।
5. Variant/serial/batch দরকার হলে যোগ।
6. Price ও cost দিন।
7. Stock দিন।
8. Barcode দিন।
9. Label print করুন।

![Product Create](/assets/LandingImage/updated/product-create.webp)

Category:

- Report ও online store display সহজ হয়।
- Example: Clothing > Men > Shirt।

Brand:

- Brand name ও image/logo দিন।

Variant:

- Size, color, flavor, weight, style।
- Example: Laptop Backpack Pro, 15.6", Gray।

Serial/batch:

- Electronics, phone, medicine, warranty product।

Bulk upload:

- Excel template download।
- Product data fill।
- Upload।
- Validation error fix।

Labels:

![Labels](/assets/LandingImage/updated/label.webp)

- Barcode/QR label print।
- Printer অনুযায়ী 58mm/80mm/A4 format ব্যবহার।

## ১৩. Stock, Low Stock, Reorder, Adjustment

Stock বদলায়:

- POS sale।
- Return।
- Purchase receive।
- Stock adjustment।
- Ecommerce sale।

![Stock Report](/assets/LandingImage/updated/stock-report.webp)

Low stock/reorder:

- Product-wise reorder threshold দিন।
- Category default ব্যবহার করুন।
- Low stock report regular দেখুন।
- Stockout হওয়ার আগে reorder suggestion ব্যবহার করুন।

Stock adjustment:

ব্যবহার করবেন যখন:

- Damaged product।
- Lost product।
- Found extra product।
- Manual correction।

সবসময় reason লিখুন।

## ১৪. Purchases and Receive

Path: `Purchases`

![Purchase Create](/assets/LandingImage/updated/purchase-create.webp)

Workflow:

1. Supplier select।
2. Item add।
3. Quantity ও cost দিন।
4. Draft save বা confirm।
5. Goods receive full/partial।
6. Receive করলে stock বাড়বে।
7. Payment অনুযায়ী supplier due update হবে।

Good practice:

- মাল হাতে না পেলে receive করবেন না।
- কম মাল এলে partial receive করুন।
- Supplier invoice number note-এ রাখুন।

## ১৫. Supplier 360

Path: `Suppliers`

![Supplier List](/assets/LandingImage/updated/supplier-list.webp)

Supplier 360-এ:

- Supplier profile।
- Contact info।
- Supplier type।
- Payment terms।
- Opening balance।
- Current due।
- Purchase history।
- Payable ageing।
- Supplier performance।

![Supplier Due](/assets/LandingImage/updated/supplier-due.webp)

Good practice:

- Khata/Excel থেকে এলে opening due দিন।
- Partial payment record করুন।
- New purchase-এর আগে supplier due দেখুন।
- Supplier report দিয়ে negotiation/reorder decision নিন।

## ১৬. Customers, CRM, Loyalty, Dues

Path: `Customers`, `Customers > CRM`

![Customer List](/assets/LandingImage/updated/customer-list.webp)

Customer module:

- Profile।
- Mobile/email/address।
- Purchase history।
- Credit balance।
- Customer due।
- Loyalty tier।
- Notes।

CRM module:

- Due customers।
- Top buyers।
- Inactive customers।
- Birthday/follow-up।
- Customer segments।
- Marketing actions।

![Customer Due](/assets/LandingImage/updated/customer-due.webp)

Good practice:

- Due sale হলে customer mobile নিন।
- Anonymous due sale করবেন না।
- Weekly customer due review করুন।
- CRM শুধু record না, repeat sale-এর জন্য ব্যবহার করুন।

## ১৭. Expenses and Accounting

Expenses:

![Expense List](/assets/LandingImage/updated/expense-list.webp)

Record:

- Rent।
- Salary।
- Utility bill।
- Transport।
- Packaging।
- Maintenance।
- Other daily cost।

Accounting:

![Cash Book](/assets/LandingImage/updated/cash-book.webp)

Modules:

- Cash book।
- Income।
- Journals।
- Chart of accounts।
- Profit & Loss।
- Balance Sheet।
- Trial Balance।
- Cash Flow।

Good practice:

- Daily expense একই দিনে লিখুন।
- Petty cash approval workflow; expense/accounting final financial record।
- Monthly closing-এর আগে cash book review করুন।

## ১৮. Reports

Path: `Reports`

![Sales Report](/assets/LandingImage/updated/sales-report.webp)

Important reports:

- Sales report।
- Sales items।
- Invoice report।
- Order returns।
- Transaction report।
- Customer due।
- Customer report।
- Purchase report।
- Purchase items।
- Purchase transaction।
- Supplier report।
- Supplier due।
- Stock report।
- Low stock।
- Reorder suggestions।
- Threshold intelligence।
- Idle product।
- Tax/VAT।
- Expense।
- Profit & Loss।
- Anomalies।
- Demand forecast।

![Profit Loss](/assets/LandingImage/updated/profit-loss.webp)

Good practice:

- Owner: dashboard daily, sales weekly, P&L monthly।
- Inventory manager: low stock/idle stock weekly।
- Accounts: tax, expense, cash book, customer due, supplier due monthly।

## ১৯. Ecommerce and Online Store

Path: `Ecommerce`

Workflow:

1. দরকার হলে ecommerce enable request করুন।
2. Product readiness দেখুন।
3. Product visible/hidden করুন।
4. Online order manage করুন।
5. Cart/wishlist review করুন।
6. POS stock sync রাখুন।

Modules:

- Stores।
- Products।
- Orders।
- Carts।
- Wishlists।
- Marketing।
- Credentials।

Courier setup:

Pathao, Steadfast, RedX credentials setup করা যায়।

![Pathao Store ID](/courier-image/pathow%20sotre-id.png)

Good practice:

- যেই courier ব্যবহার করেন শুধু সেটাই configure করুন।
- API credential private রাখুন।
- Public launch-এর আগে একটি test order করুন।

## ২০. Staff, Roles, Permissions, Audit

Path: `Roles`, `Employees`, `Audit Logs`

Role দিয়ে control করুন:

- POS access।
- Product edit।
- Purchase create।
- Reports view।
- Cash closing approval।
- Petty cash approval।
- HR attendance।
- Ecommerce settings।

Good practice:

- Owner password share করবেন না।
- Cashier-কে cashier permission দিন।
- Manager approval permission carefully দিন।
- Data ভুল মনে হলে audit logs দেখুন।

## ২১. Notifications

Notification আসে:

- Low stock।
- New order।
- System event।
- Announcement।
- Team broadcast।

Return policy বা stock-count day জানাতে announcement ব্যবহার করুন।

## ২২. Data Export and Backup

Data export দরকার যখন:

- Accountant record চান।
- Owner offline archive চান।
- Migration backup দরকার।
- Tax/government support document দরকার।

Module অনুযায়ী Excel/PDF export থাকে।

## ২৩. Multi-Store Operation

একাধিক branch থাকলে:

1. প্রতিটি store যোগ করুন।
2. Staff কে সঠিক store assign করুন।
3. Store-wise inventory রাখুন।
4. Branch-wise sales দেখুন।
5. Branch performance compare করুন।
6. Owner unified report দেখবেন।

Good practice:

- Cash closing store-wise হবে।
- Supplier/customer due store filter দিয়ে দেখুন, দরকার হলে।
- Staff-কে unrelated branch access দেবেন না।

## ২৪. Recommended Daily Routine

Morning:

1. Dashboard দেখুন।
2. Low stock দেখুন।
3. Opening cash confirm করুন।
4. Pending ecommerce/service jobs দেখুন।

During day:

1. সব sale POS দিয়ে করুন।
2. Customer due ঠিকভাবে record করুন।
3. Petty cash request record করুন।
4. মাল হাতে পেলে purchase receive করুন।
5. Service job status update করুন।

End of day:

1. Physical cash গুনুন।
2. Cash closing submit করুন।
3. bKash/Nagad/card collection মিলান।
4. আজকের customer due দেখুন।
5. Petty cash approve/reject করুন।
6. Sales ও stock alert review করুন।

Weekly:

1. Supplier dues।
2. Customer dues।
3. Low stock/reorder।
4. Idle products।
5. Staff attendance।

Monthly:

1. Profit & Loss।
2. Tax/VAT।
3. Expenses।
4. Accountant-এর জন্য report export।
5. Staff role/access review।

## ২৫. Troubleshooting

Login page stuck:

- Reload করুন।
- Incognito/private mode try করুন।
- Cache clear করুন।
- Support-এ যোগাযোগ করুন।

POS price/discount ভুল:

- Product price check।
- Variant price check।
- Coupon/discount rule check।
- Quantity check।
- Tax setting check।
- Cart item remove করে আবার add করুন।

Stock ভুল:

- Purchase receive history।
- Return।
- Stock adjustment।
- Ecommerce order।
- Serial/variant stock।

Customer due ভুল:

- Order payment।
- Partial payment।
- Due collection।
- Customer profile।

Cash closing mismatch:

- Cash আবার গুনুন।
- Cash এবং bKash/Nagad/card আলাদা করুন।
- Petty cash/cash expense check।
- Supplier payment check।
- Due collection check।

## ২৬. Support

Setup, training, বা data migration support:

- Website: `https://andgatepos.com`
- Contact: `https://andgatepos.com/contact`
- Email/phone: website footer-এর current contact detail ব্যবহার করুন।


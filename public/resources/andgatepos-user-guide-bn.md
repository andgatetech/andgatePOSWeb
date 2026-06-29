# AndgatePOS ব্যবহার নির্দেশিকা

ভার্সন: জুন ২০২৬  
কার জন্য: বাংলাদেশি SME ব্যবসার মালিক, দোকান ম্যানেজার, ক্যাশিয়ার, স্টক কর্মী, হিসাব কর্মী এবং ecommerce অপারেটর।

## ১. AndgatePOS কী করে

AndgatePOS হলো বাংলাদেশি SME ব্যবসার জন্য POS এবং Business OS। এতে আছে কাউন্টার বিক্রি, স্টক, ক্রয়, সাপ্লায়ার, কাস্টমার, CRM, ক্যাশ ক্লোজিং, পেটি ক্যাশ, কর্মী হাজিরা, সার্ভিস জব, হিসাব, রিপোর্ট, ecommerce, courier setup, staff role এবং multi-store operation।

![ড্যাশবোর্ড](/assets/LandingImage/updated/dashboard.webp)

## কীভাবে ধাপে ধাপে AndgatePOS শিখবেন

আপনি technical না হলেও সমস্যা নেই। একদিনে সব শেখার দরকার নেই। এই order অনুসরণ করুন।

দিন ১: Login, dashboard, store switcher, POS sale, invoice print শিখুন।  
দিন ২: Product, category, brand, stock, barcode label শিখুন।  
দিন ৩: Customer, customer due, supplier, purchase, supplier due শিখুন।  
দিন ৪: Cash closing, petty cash, attendance, service job, Business OS শিখুন।  
দিন ৫: Report, profit/loss, tax, ecommerce, courier, staff permission শিখুন।

প্রতিটি কাজের সহজ নিয়ম:

1. Menu খুলুন।
2. `Add`, `Create`, `Save`, `Submit`, বা `Approve` button চাপুন।
3. Required field আগে পূরণ করুন।
4. Save করুন।
5. List/report দেখে নিশ্চিত করুন কাজ হয়েছে।

মনে রাখবেন: আগে basic data তৈরি, তারপর POS-এ ব্যবহার। যেমন category তৈরি, brand তৈরি, product তৈরি, তার11পর product sell।

## Non-Technical Quick Start: ১৫ মিনিটে প্রথম sale

এই ধাপগুলো একদম একইভাবে করুন।

1. Login করুন।
2. `Store` খুলুন।
3. Store name, phone, address, logo ঠিক আছে কিনা দেখুন।
4. `Category` খুলুন।
5. একটি category তৈরি করুন, যেমন `Grocery`।
6. `Brand` খুলুন।
7. একটি brand তৈরি করুন, অথবা দরকার না হলে `No Brand` দিন।
8. `Products` খুলুন।
9. `Add Product` চাপুন।
10. Product name, category, brand, unit, sale price, cost price, opening stock দিন।
11. Save করুন।
12. `POS` খুলুন।
13. Product name search করুন।
14. Product cart-এ add করুন।
15. Payment method `Cash` নির্বাচন করুন।
16. Sale complete করুন।
17. Invoice print/save করুন।
18. `Orders` খুলে sale আছে কিনা দেখুন।
19. `Products` খুলে stock কমেছে কিনা দেখুন।
20. দিনশেষে `Cash Closing` খুলে counted cash submit করুন।

এটাই AndgatePOS-এর সবচেয়ে ছোট complete workflow।

## Role অনুযায়ী শেখার পথ

Owner:

1. Dashboard।
2. Business OS।
3. Reports।
4. Cash closing approval।
5. Petty cash approval।
6. Supplier dues।
7. Customer dues।
8. Profit & Loss।

Cashier:

1. POS।
2. Product search/barcode scan।
3. Customer selection।
4. Payment।
5. Invoice print।
6. Returns।
7. Cash closing submit।

Inventory/Purchase Staff:

1. Products।
2. Stock।
3. Low stock।
4. Suppliers।
5. Purchase order।
6. Receive goods।
7. Stock adjustment।

Accounts Staff:

1. Expenses।
2. Petty cash review।
3. Cash book।
4. Customer due।
5. Supplier due।
6. Profit & Loss।
7. Tax/VAT।

Ecommerce Staff:

1. Ecommerce products।
2. Product readiness।
3. Online orders।
4. Courier setup।
5. Delivery status।

Service Staff:

1. Service jobs।
2. Create job।
3. Update status।
4. Mark delivered।

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

## ৩.১ Step-by-Step Store Setup

1. `Store` খুলুন।
2. Store name বা `Settings` চাপুন।
3. Store name, address, phone, email, business type পূরণ করুন।
4. Logo থাকলে upload করুন।
5. Currency BDT/Taka আছে কিনা দেখুন।
6. Save করুন।
7. Invoice/receipt setting থাকলে খুলুন।
8. Footer note দিন, যেমন `Thank you for shopping`।
9. আবার Save করুন।
10. একটি test invoice করুন।

Multiple branch থাকলে:

1. `Store` খুলুন।
2. `Add Store` চাপুন।
3. Branch name/location দিন।
4. Staff assign করুন।
5. Store switcher-এ branch দেখা যাচ্ছে কিনা দেখুন।

## ৩.২ Step-by-Step Staff and Permission Setup

1. `Employees` বা `Users` খুলুন।
2. `Add` চাপুন।
3. Staff name, phone/email, password দিন।
4. `Roles` খুলুন।
5. Role তৈরি করুন: `Cashier`, `Manager`, `Inventory`, `Accounts`।
6. ঐ staff যে module ব্যবহার করবে শুধু সেগুলো tick দিন।
7. Save করুন।
8. Staff-কে role assign করুন।
9. Staff দিয়ে একবার login করান।
10. সে শুধু allowed menu দেখতে পাচ্ছে কিনা confirm করুন।

Simple permission:

- Cashier: POS, Orders, Customers basic, Cash Closing submit।
- Manager: POS, Products view, Reports, Cash Closing approve, Petty Cash approve।
- Owner: সব module।

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

### Step-by-Step: Cash Sale

1. `POS` খুলুন।
2. Search box-এ click করুন।
3. Product name লিখুন বা barcode scan করুন।
4. Product click করুন।
5. Quantity ঠিক আছে কিনা দেখুন।
6. Customer cash দিলে `Cash` নির্বাচন করুন।
7. Received amount চাইলে দিন।
8. `Pay`, `Complete`, বা `Submit` চাপুন।
9. Invoice print/save করুন।
10. Customer-কে receipt দিন।

### Step-by-Step: bKash/Nagad Sale

1. `POS` খুলুন।
2. Product cart-এ add করুন।
3. Payment method `bKash` বা `Nagad` দিন।
4. Transaction/mobile number রাখলে লিখুন।
5. Paid amount confirm করুন।
6. Sale complete করুন।
7. `Orders`-এ payment method দেখুন।

### Step-by-Step: Due Sale

1. `POS` খুলুন।
2. Product add করুন।
3. Existing customer select করুন বা new customer create করুন।
4. Payment amount দিন।
5. Unpaid amount due রাখুন।
6. Sale complete করুন।
7. Customer profile খুলে due বেড়েছে কিনা দেখুন।

Customer name/mobile ছাড়া due sale করবেন না। পরে টাকা আদায় কঠিন হবে।

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

### Step-by-Step: একটি Product Add

1. `Category` খুলুন।
2. `Add Category` চাপুন।
3. Category name দিন।
4. Save করুন।
5. `Brand` খুলুন।
6. `Add Brand` চাপুন।
7. Brand name দিন, অথবা `No Brand` ব্যবহার করুন।
8. Save করুন।
9. `Products` খুলুন।
10. `Add Product` চাপুন।
11. Product name দিন।
12. Category select করুন।
13. Brand select করুন।
14. Sale price দিন।
15. Cost price দিন।
16. Opening stock দিন।
17. Unit দিন, যেমন `piece`।
18. Barcode থাকলে দিন।
19. Save করুন।
20. `POS` খুলে product search করে confirm করুন।

### Step-by-Step: Size/Color Product

1. `Products` খুলুন।
2. `Add Product` চাপুন।
3. Main product name দিন।
4. Variant/attribute section খুঁজুন।
5. Size, color বা option add করুন।
6. প্রতিটি variant-এর price ও stock দিন।
7. Save করুন।
8. POS-এ test করুন, cashier variant choose করতে পারবে।

### Step-by-Step: Barcode Label Print

1. `Label` page খুলুন।
2. Product select করুন।
3. Label size select করুন।
4. Label quantity দিন।
5. Preview দেখুন।
6. Print করুন।
7. POS-এ printed barcode scan করে test করুন।

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

### Step-by-Step: Supplier থেকে Stock কেনা

1. `Suppliers` খুলুন।
2. Supplier না থাকলে add করুন।
3. `Purchases` খুলুন।
4. `Add Purchase` চাপুন।
5. Supplier select করুন।
6. Product add করুন।
7. Quantity ও purchase cost দিন।
8. Purchase order save করুন।
9. মাল এলে purchase receive খুলুন।
10. Received quantity দিন।
11. Save receive করুন।
12. Product list খুলে stock বেড়েছে কিনা দেখুন।
13. Supplier due খুলে payable amount দেখুন।

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

### Step-by-Step: আজকের Sales দেখা

1. `Reports` খুলুন।
2. `Sales Report` খুলুন।
3. আজকের date নির্বাচন করুন।
4. দরকার হলে store select করুন।
5. Filter/search চাপুন।
6. Total sale, payment breakdown, sold items দেখুন।
7. Owner/accountant দরকার হলে export করুন।

### Step-by-Step: Profit/Loss দেখা

1. `Accounting` বা `Reports` খুলুন।
2. `Profit & Loss` খুলুন।
3. Date range select করুন।
4. Filter/search চাপুন।
5. Sales, cost, expense, net profit দেখুন।
6. Accountant-এর জন্য PDF/Excel export করুন।

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

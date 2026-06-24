# AndgatePOS User Guide

Version: June 2026  
Audience: Bangladeshi SME owners, shop managers, cashiers, inventory staff, accounts staff, and ecommerce operators.

## 1. What AndgatePOS Does

AndgatePOS is a POS and Business OS for Bangladeshi SMEs. It covers counter sales, stock, purchases, suppliers, customers, CRM, cash closing, petty cash, attendance, service jobs, accounting, reports, ecommerce, courier setup, staff roles, and multi-store operation.

Use this guide as a full workflow manual. Screenshots use existing product images where available.

![Dashboard](/assets/LandingImage/updated/dashboard.webp)

## How to Learn AndgatePOS Step by Step

If you are not technical, do not try to learn every module on day one. Follow this order.

Day 1: Learn only login, dashboard, store switcher, POS sale, and invoice print.  
Day 2: Add products, categories, brands, stock, and barcode labels.  
Day 3: Learn customers, customer dues, suppliers, purchases, and supplier dues.  
Day 4: Learn cash closing, petty cash, attendance, service jobs, and Business OS.  
Day 5: Learn reports, profit/loss, tax, ecommerce, courier, and staff permissions.

Every task in this guide follows this pattern:

1. Go to the menu.
2. Press the main button, usually `Add`, `Create`, `Save`, `Submit`, or `Approve`.
3. Fill required fields first.
4. Save.
5. Check the list/report to confirm it worked.

If you feel stuck, remember this rule: first create basic data, then use it in POS. Example: create category, create brand, create product, then sell product.

## Non-Technical Quick Start: First Sale in 15 Minutes

Follow these steps exactly.

1. Login.
2. Open `Store`.
3. Confirm your store name, phone, address, and logo.
4. Open `Category`.
5. Create one category, for example `Grocery`.
6. Open `Brand`.
7. Create one brand, or create `No Brand` if brand does not matter.
8. Open `Products`.
9. Click `Add Product`.
10. Enter product name, category, brand, unit, sale price, cost price, and opening stock.
11. Save product.
12. Open `POS`.
13. Search the product name.
14. Add product to cart.
15. Choose payment method, for example `Cash`.
16. Complete sale.
17. Print or save invoice.
18. Open `Orders` and confirm the sale appears.
19. Open `Products` and confirm stock decreased.
20. At day end, open `Cash Closing` and submit counted cash.

This is the smallest complete AndgatePOS workflow.

## Role-Based Learning Path

Owner:

1. Dashboard.
2. Business OS.
3. Reports.
4. Cash closing approval.
5. Petty cash approval.
6. Supplier dues.
7. Customer dues.
8. Profit & Loss.

Cashier:

1. POS.
2. Product search/barcode scan.
3. Customer selection.
4. Payment.
5. Invoice print.
6. Returns.
7. Cash closing submit.

Inventory/Purchase Staff:

1. Products.
2. Stock.
3. Low stock.
4. Suppliers.
5. Purchase order.
6. Receive goods.
7. Stock adjustment.

Accounts Staff:

1. Expenses.
2. Petty cash review.
3. Cash book.
4. Customer due.
5. Supplier due.
6. Profit & Loss.
7. Tax/VAT.

Ecommerce Staff:

1. Ecommerce products.
2. Product readiness.
3. Online orders.
4. Courier setup.
5. Order delivery status.

Service Staff:

1. Service jobs.
2. Create job.
3. Update status.
4. Mark delivered.

## 2. Login, Store Access, and Language

1. Open `https://andgatepos.com/login`.
2. Enter email and password.
3. Select the correct store if your account has more than one store.
4. Use the language switcher to use English or Bangla.
5. If a page does not load after a deployment, reload once. If still stuck, clear browser cache or contact support.

Important access notes:

- Business owner/admin can access all modules for their store.
- Staff access depends on role permissions.
- Cashiers usually need POS, orders, customer lookup, and cash closing.
- Managers usually need reports, cash closing approval, petty cash approval, staff attendance, and stock review.
- Accounts staff usually need expenses, accounting, reports, supplier/customer dues, and cash book.

## 3. First Setup Checklist

Complete these before regular sales:

1. Create or verify store profile.
2. Add payment methods: Cash, bKash, Nagad, Rocket, Upay, Card, Bank Transfer.
3. Set VAT/tax settings if applicable.
4. Create categories and brands.
5. Add products with price, cost, unit, stock, barcode, variant, serial/batch if needed.
6. Add suppliers and opening supplier dues.
7. Add customers and opening customer dues if needed.
8. Create staff users and assign roles.
9. Test one POS sale, one return, one cash closing, and one report.
10. If using ecommerce, configure online store products and courier credentials.

![Store List](/assets/LandingImage/updated/store-list.webp)

## 3.1 Step-by-Step Store Setup

1. Open `Store`.
2. Click your store name or `Settings`.
3. Fill store name, address, phone, email, and business type.
4. Upload logo if available.
5. Choose currency as BDT/Taka if not already set.
6. Save.
7. Open invoice/receipt setting if available.
8. Add footer note, for example `Thank you for shopping`.
9. Save again.
10. Make one test invoice after setup.

If you have multiple branches:

1. Open `Store`.
2. Click `Add Store`.
3. Add branch name and location.
4. Assign staff to that branch.
5. Check that branch appears in store switcher.

## 3.2 Step-by-Step Staff and Permission Setup

1. Open `Employees` or `Users`.
2. Click `Add`.
3. Enter staff name, phone/email, and password if required.
4. Open `Roles`.
5. Create role such as `Cashier`, `Manager`, `Inventory`, or `Accounts`.
6. Tick only the modules that person needs.
7. Save role.
8. Assign role to staff.
9. Ask staff to login once.
10. Confirm they can see only allowed menus.

Simple permission example:

- Cashier: POS, Orders, Customers basic, Cash Closing submit.
- Manager: POS, Products view, Reports, Cash Closing approve, Petty Cash approve.
- Owner: all modules.

## 4. Dashboard

Dashboard gives owner/manager quick visibility:

- Today's sales and order count.
- Top products.
- Pending orders.
- Low stock alerts.
- Store switcher.
- Date range filters.
- Quick operational signals.

Daily habit:

1. Check sales.
2. Check low stock.
3. Check customer dues.
4. Check supplier dues.
5. Check pending tasks in Business OS.

## 5. Business OS Command Center

Business OS is the owner/manager command center. It should not be mixed with POS checkout because some work is done by owners/managers, while some is done by staff.

Covers:

- Cash and counter closing.
- Petty cash.
- Staff attendance.
- Service and repair jobs.
- Business tasks/follow-ups.
- Customer due signals.
- Supplier due signals.
- Reorder signals.

Recommended roles:

- Owner: full access.
- Manager: view Business OS, approve cash closing/petty cash, view staff attendance.
- Cashier: submit cash closing only.
- Employee: submit attendance/service updates if allowed.

## 6. Cash and Counter Closing

Use after shift/day end.

Path: `Cash Closing`

Staff/cashier enters:

- Opening cash.
- Cash sales.
- Cash expense.
- Due collection.
- Supplier payment.
- Actual counted cash.
- Note.

System calculates:

- Expected cash.
- Difference between expected and actual.

Manager/owner can:

- Approve closing.
- Reject closing.
- Review past closings.

Good practice:

- Count cash physically before submit.
- Do not include bKash/Nagad/card in physical cash.
- Add note for shortage/extra cash.
- Approve only after matching POS sales, expenses, and due collections.

## 7. Petty Cash

Use for small shop expenses like tea, transport, packaging, emergency repair, delivery helper cost, or small utility items.

Path: `Petty Cash`

Workflow:

1. Staff submits request with title, amount, and requester name.
2. Owner/manager approves or rejects.
3. Approved requests remain in petty cash history.

Good practice:

- Keep petty cash separate from POS sales cash.
- Use clear titles: "Delivery rickshaw", "Packaging tape", "Tea for staff".
- Review petty cash before profit/loss review.

## 8. HR Attendance

Path: `HR > Attendance`

Use for:

- Staff check-in.
- Staff check-out.
- Late arrival note.
- Early leave note.
- Shift handover note.

Good practice:

- Staff should check in when arriving.
- Manager should review attendance before salary or shift planning.
- Use notes for exceptions.

## 9. Service and Repair Jobs

Path: `Service Jobs`

Useful for electronics shops, mobile shops, repair shops, after-sales service, tailoring, or any SME that receives customer items for later delivery.

Create job with:

- Customer name.
- Item name.
- Problem.
- Due date.
- Status.

Statuses:

- Received.
- Working.
- Ready.
- Delivered.

Good practice:

- Add clear problem description.
- Keep due date realistic.
- Update status when work moves forward.
- Use delivered status only after customer receives item.

## 10. POS Terminal

Path: `POS`

![POS Terminal](/assets/LandingImage/updated/pos.webp)

### Step-by-Step: Make a Cash Sale

1. Open `POS`.
2. Click search box.
3. Type product name or scan barcode.
4. Click product.
5. Check quantity.
6. If customer pays by cash, choose `Cash`.
7. Enter received amount if asked.
8. Click `Pay`, `Complete`, or `Submit`.
9. Print invoice or save invoice.
10. Give receipt to customer.

### Step-by-Step: Make a bKash/Nagad Sale

1. Open `POS`.
2. Add products to cart.
3. Choose payment method `bKash` or `Nagad`.
4. Enter transaction number/mobile number if your store records it.
5. Confirm paid amount.
6. Complete sale.
7. Check order payment method in `Orders`.

### Step-by-Step: Sell on Due

1. Open `POS`.
2. Add products.
3. Select existing customer or create customer.
4. Enter payment amount.
5. Keep unpaid amount as due.
6. Complete sale.
7. Open customer profile and confirm due increased.

Never sell on due without customer name/mobile. Otherwise owner cannot collect later.

Main workflow:

1. Search product by name or scan barcode.
2. Select variant/serial if product requires it.
3. Set quantity.
4. Apply item discount or order discount if allowed.
5. Select customer if due/loyalty/history needed.
6. Take payment.
7. Print or save invoice.

Supported payment use cases:

- Full cash.
- bKash/Nagad/Rocket/Upay.
- Card.
- Bank transfer.
- Split payment.
- Partial payment and customer due.

Offline POS:

- If internet is unstable, POS can keep working locally where offline mode is enabled.
- Orders sync when internet returns.
- Avoid closing browser before sync completes.

## 11. Orders, Invoices, Returns, and Coupons

Path: `Orders`

![Orders](/assets/LandingImage/updated/orders.webp)

Use orders to:

- View sales history.
- Print invoice.
- Check payment status.
- Start return.
- Review customer/order detail.

Returns:

1. Open order.
2. Select return items.
3. Choose return reason.
4. Decide whether returned stock goes back to inventory.
5. Process refund or adjustment.

Coupons:

- Create coupon code.
- Set discount.
- Apply in POS/order workflow where allowed.
- Review discount effect in daily sales/reporting.

## 12. Products, Categories, Brands, Variants, and Labels

Product setup is the foundation of clean POS and stock.

![Product List](/assets/LandingImage/updated/products.webp)

### Step-by-Step: Add One Product

1. Open `Category`.
2. Click `Add Category`.
3. Enter category name.
4. Save.
5. Open `Brand`.
6. Click `Add Brand`.
7. Enter brand name, or use `No Brand`.
8. Save.
9. Open `Products`.
10. Click `Add Product`.
11. Enter product name.
12. Select category.
13. Select brand.
14. Enter sale price.
15. Enter cost price.
16. Enter opening stock.
17. Enter unit, for example `piece`.
18. Add barcode if available.
19. Save.
20. Open `POS` and search the product to confirm it is sellable.

### Step-by-Step: Add Product With Size or Color

1. Open `Products`.
2. Click `Add Product`.
3. Enter main product name.
4. Find variant/attribute section.
5. Add size, color, or other option.
6. Enter price and stock for each variant.
7. Save.
8. Test in POS: product should ask cashier to choose variant.

### Step-by-Step: Print Barcode Label

1. Open `Label` or product label page.
2. Select product.
3. Choose label size.
4. Enter label quantity.
5. Preview.
6. Print.
7. Scan printed barcode in POS to confirm it works.

Recommended order:

1. Create categories.
2. Create brands.
3. Add units and warranty defaults if needed.
4. Add products.
5. Add variants/serials/batches if needed.
6. Set price and cost.
7. Set stock.
8. Add barcode.
9. Print labels.

![Product Create](/assets/LandingImage/updated/product-create.webp)

Categories:

- Use category tree for easier reporting and online store display.
- Example: Clothing > Men > Shirt.

Brands:

- Add brand name and image/logo.
- Useful for filters and reports.

Variants:

- Use for size, color, flavor, weight, style.
- Example: Laptop Backpack Pro, 15.6", Gray.

Serials/batches:

- Use for electronics, phones, medicine, warranty products.

Bulk upload:

- Download Excel template.
- Fill product data.
- Upload.
- Fix validation errors before import.

Labels:

![Labels](/assets/LandingImage/updated/label.webp)

- Print barcode/QR labels.
- Use 58mm/80mm/A4 formats depending on printer and label sheet.

## 13. Stock, Low Stock, Reorder, and Adjustments

Stock changes from:

- POS sale.
- Order return.
- Purchase receive.
- Stock adjustment.
- Ecommerce sale.

![Stock Report](/assets/LandingImage/updated/stock-report.webp)

Low stock/reorder:

- Set reorder threshold per product.
- Use category default if many products share same threshold.
- Review low-stock report regularly.
- Use reorder suggestions before stockout.

Stock adjustment:

Use only when needed:

- Damaged product.
- Lost product.
- Found extra product.
- Manual correction.

Always write reason. This protects audit history.

## 14. Purchases and Purchase Receive

Path: `Purchases`

![Purchase Create](/assets/LandingImage/updated/purchase-create.webp)

### Step-by-Step: Buy Stock From Supplier

1. Open `Suppliers`.
2. Add supplier if not already added.
3. Open `Purchases`.
4. Click `Add Purchase`.
5. Select supplier.
6. Add products.
7. Enter quantity and purchase cost.
8. Save purchase order.
9. When goods arrive, open purchase receive.
10. Enter received quantity.
11. Save receive.
12. Open product list and confirm stock increased.
13. Open supplier due and confirm payable amount.

Purchase order workflow:

1. Select supplier.
2. Add items.
3. Enter quantity and cost.
4. Save draft or confirm.
5. Receive goods fully or partially.
6. Stock increases after receive.
7. Supplier due updates based on payment.

Good practice:

- Do not receive goods before physically checking.
- Use partial receive if supplier sends less than ordered.
- Attach supplier invoice number in note when possible.

## 15. Supplier 360

Path: `Suppliers`

![Supplier List](/assets/LandingImage/updated/supplier-list.webp)

Supplier 360 helps with:

- Supplier profile.
- Contact info.
- Supplier type.
- Payment terms.
- Opening balance.
- Current due.
- Purchase history.
- Payable ageing.
- Supplier performance.

![Supplier Due](/assets/LandingImage/updated/supplier-due.webp)

Good practice:

- Add opening due when migrating from khata/Excel.
- Record partial payments.
- Review supplier due before new purchase.
- Use supplier reports for negotiation and reorder decisions.

## 16. Customers, CRM, Loyalty, and Dues

Path: `Customers` and `Customers > CRM`

![Customer List](/assets/LandingImage/updated/customer-list.webp)

Customer module:

- Customer profile.
- Mobile/email/address.
- Purchase history.
- Credit balance.
- Customer due.
- Loyalty tier.
- Notes.

CRM module:

- Due customers.
- Top buyers.
- Inactive customers.
- Birthday/follow-up opportunities.
- Customer segments.
- Marketing actions.

![Customer Due](/assets/LandingImage/updated/customer-due.webp)

Good practice:

- Add customer mobile during sale if due is allowed.
- Do not allow anonymous due sale.
- Review customer dues weekly.
- Use CRM for repeat sales, not only record keeping.

## 17. Expenses and Accounting

Expenses:

![Expense List](/assets/LandingImage/updated/expense-list.webp)

Record:

- Rent.
- Salary.
- Utility bill.
- Transport.
- Packaging.
- Maintenance.
- Other daily business cost.

Accounting:

![Cash Book](/assets/LandingImage/updated/cash-book.webp)

Modules:

- Cash book.
- Income.
- Journals.
- Chart of accounts.
- Profit & Loss.
- Balance Sheet.
- Trial Balance.
- Cash Flow.

Good practice:

- Record daily expenses on the day they happen.
- Use petty cash for approval workflow; use expense/accounting for final financial record.
- Review cash book before monthly closing.

## 18. Reports

Path: `Reports`

![Sales Report](/assets/LandingImage/updated/sales-report.webp)

### Step-by-Step: Check Today's Sales

1. Open `Reports`.
2. Open `Sales Report`.
3. Choose today's date.
4. Select store if needed.
5. Click filter/search.
6. Check total sale, payment breakdown, and items sold.
7. Export if owner/accountant needs it.

### Step-by-Step: Check Profit/Loss

1. Open `Accounting` or `Reports`.
2. Open `Profit & Loss`.
3. Select date range.
4. Click filter/search.
5. Review sales, cost, expense, and net profit.
6. Export PDF/Excel for accountant.

Important reports:

- Sales report.
- Sales items.
- Invoice report.
- Order returns.
- Transaction report.
- Customer due.
- Customer report.
- Purchase report.
- Purchase items.
- Purchase transaction.
- Supplier report.
- Supplier due.
- Stock report.
- Low stock.
- Reorder suggestions.
- Threshold intelligence.
- Idle product.
- Tax/VAT.
- Expense.
- Profit & Loss.
- Anomalies.
- Demand forecast.

![Profit Loss](/assets/LandingImage/updated/profit-loss.webp)

Good practice:

- Owner: review dashboard daily, sales weekly, P&L monthly.
- Inventory manager: review low stock and idle stock weekly.
- Accounts: review tax, expense, cash book, customer due, supplier due monthly.

## 19. Ecommerce and Online Store

Path: `Ecommerce`

Online store workflow:

1. Enable ecommerce for store if required.
2. Review ecommerce product readiness.
3. Make products visible/hidden.
4. Manage online orders.
5. Review carts and wishlists.
6. Sync stock with POS.

Ecommerce modules:

- Stores.
- Products.
- Orders.
- Carts.
- Wishlists.
- Marketing.
- Credentials.

Courier setup:

Supported provider setup screens include Pathao, Steadfast, and RedX credentials.

![Pathao Store ID](/courier-image/pathow%20sotre-id.png)

Good practice:

- Configure only the courier provider your store actually uses.
- Keep API credentials private.
- Test one order before public launch.

## 20. Staff, Roles, Permissions, and Audit

Path: `Roles`, `Employees`, `Audit Logs`

Use roles to control:

- POS access.
- Product edit.
- Purchase create.
- Reports view.
- Cash closing approval.
- Petty cash approval.
- HR attendance.
- Ecommerce settings.

Good practice:

- Do not share owner password.
- Give cashier only cashier permissions.
- Give manager approval permissions carefully.
- Review audit logs if data looks wrong.

## 21. Notifications

Notifications can cover:

- Low stock.
- New orders.
- System events.
- Announcements.
- Broadcast messages to team.

Use announcements for operational changes like new return policy or stock-count day.

## 22. Data Export and Backup

Use data export when:

- Accountant needs records.
- Owner wants offline archive.
- Business needs migration backup.
- Government/tax support document needed.

Export formats depend on module, commonly Excel/PDF.

## 23. Multi-Store Operation

Use multi-store when business has multiple branches.

Workflow:

1. Add each store.
2. Assign staff to correct store.
3. Keep store-wise inventory.
4. Review branch-wise sales.
5. Compare branch performance.
6. Use unified reports for owner view.

Good practice:

- Cash closing must be store-wise.
- Supplier/customer dues should be reviewed with store filter when needed.
- Staff should not get access to unrelated branches.

## 24. Recommended Daily Routine

Morning:

1. Check dashboard.
2. Review low stock.
3. Confirm store opening cash.
4. Check pending ecommerce/service jobs.

During day:

1. Use POS for every sale.
2. Record customer due correctly.
3. Record petty cash requests.
4. Receive purchase goods only after checking.
5. Update service job status.

End of day:

1. Count physical cash.
2. Submit cash closing.
3. Review bKash/Nagad/card collections.
4. Check customer due created today.
5. Approve/reject petty cash.
6. Review sales and stock alerts.

Weekly:

1. Review supplier dues.
2. Review customer dues.
3. Review low stock and reorder suggestions.
4. Review idle products.
5. Review staff attendance.

Monthly:

1. Review Profit & Loss.
2. Review tax/VAT.
3. Review expenses.
4. Export reports for accountant.
5. Review staff roles and access.

## 25. Troubleshooting

Login page stuck:

- Reload once.
- Try incognito/private mode.
- Clear cache if old frontend is stuck.
- Contact support if problem continues.

POS item price/discount looks wrong:

- Check product price.
- Check variant price.
- Check coupon/discount rule.
- Check quantity.
- Check tax setting.
- Check if old cart item needs removing and adding again.

Stock wrong:

- Check purchase receive history.
- Check returns.
- Check stock adjustments.
- Check ecommerce orders.
- Check serial/variant stock.

Customer due wrong:

- Check order payment.
- Check partial payment.
- Check due collection.
- Check customer profile.

Cash closing mismatch:

- Count cash again.
- Separate cash from bKash/Nagad/card.
- Check petty cash and cash expense.
- Check supplier payment.
- Check due collection.

## 26. Support

For setup help, training, or data migration support:

- Website: `https://andgatepos.com`
- Contact page: `https://andgatepos.com/contact`
- Support email/phone: use current contact details from the website footer.

# Quick Reference: Backend API Data Structure

## What Frontend Sends to Backend

### Payment Status Rules

| Customer Type               | payment_status | amount_paid                  | due_amount       | change_amount    |
| --------------------------- | -------------- | ---------------------------- | ---------------- | ---------------- |
| Walk-in                     | `"paid"` only  | full amount or cash received | 0                | change (if cash) |
| Existing Customer (paid)    | `"paid"`       | full amount                  | 0                | change (if cash) |
| Existing Customer (due)     | `"due"`        | 0                            | full amount      | 0                |
| Existing Customer (partial) | `"partial"`    | partial amount               | remaining amount | 0                |

---

## Base Order Structure

```typescript
{
  // IDs
  user_id: number,
  store_id: number,

  // Payment
  payment_method: string,        // "cash", "card", etc.
  payment_status: string,        // "paid", "due", "partial"

  // Amounts
  tax: number,
  discount: number,
  total: number,                 // Subtotal without tax
  grand_total: number,           // Final total
  amount_paid: number,           // What customer paid
  change_amount: number,         // Change to return
  due_amount: number,            // What's owed

  // Customer (one of three patterns)
  customer_id: number | null,
  is_walk_in: boolean,
  customer_name?: string,        // For new customers
  customer_email?: string,
  customer_number?: string,

  // Items
  items: OrderItem[]
}
```

---

## Order Item Variations

### 1. Simple Product

```json
{
    "product_id": 101,
    "quantity": 2,
    "unit_price": 500.0,
    "unit": "piece",
    "discount": 0,
    "tax": 5,
    "tax_included": false,
    "subtotal": 1050.0
}
```

### 2. Product with Variant

```json
{
  ...simpleProduct,
  "stock_id": 555
}
```

**Backend Action:** Update stock for `stock_id: 555`

### 3. Product with Serial Numbers

```json
{
  ...simpleProduct,
  "serial_ids": [1001, 1002, 1003]
}
```

**Backend Action:** Mark these serials as sold, link to customer

### 4. Product with Warranty

```json
{
  ...simpleProduct,
  "warranty_id": 5,
  "activate_warranty": true
}
```

**Backend Action:** Create warranty record, calculate end_date

### 5. Complex Product (All Features)

```json
{
    "product_id": 101,
    "stock_id": 555,
    "serial_ids": [1001, 1002],
    "warranty_id": 5,
    "activate_warranty": true,
    "quantity": 2,
    "unit_price": 500.0,
    "unit": "piece",
    "discount": 0,
    "tax": 5,
    "tax_included": false,
    "subtotal": 1050.0
}
```

**Backend Action:**

1. Update variant stock (stock_id: 555)
2. Mark serials sold
3. Create warranty records

---

## Quick Examples

### Walk-in Customer (Paid)

```json
{
    "customer_id": null,
    "is_walk_in": true,
    "payment_status": "paid",
    "grand_total": 1000.0,
    "amount_paid": 1000.0,
    "due_amount": 0
}
```

### Existing Customer (Due)

```json
{
    "customer_id": 45,
    "is_walk_in": false,
    "payment_status": "due",
    "grand_total": 2000.0,
    "amount_paid": 0,
    "due_amount": 2000.0
}
```

**Backend:** Create due record for customer 45

### Existing Customer (Partial)

```json
{
    "customer_id": 78,
    "is_walk_in": false,
    "payment_status": "partial",
    "grand_total": 3000.0,
    "amount_paid": 1200.0,
    "due_amount": 1800.0
}
```

**Backend:** Record ৳1200 paid, ৳1800 due for customer 78

---

## Backend Tasks Checklist

### Always:

-   [ ] Create order record
-   [ ] Create order items
-   [ ] Update product stock

### If variant (stock_id present):

-   [ ] Update variant stock instead of main product stock

### If serial_ids present:

-   [ ] Mark serials as sold
-   [ ] Link serials to customer
-   [ ] Link serials to order

### If warranty (warranty_id present):

-   [ ] Create warranty record
-   [ ] Calculate warranty end_date
-   [ ] Link to customer and order
-   [ ] Set status to "active"

### If payment_status = "due" or "partial":

-   [ ] Create customer due record
-   [ ] Store paid_amount and due_amount
-   [ ] Link to customer and order

---

## Validation Rules

### Must Validate:

1. Walk-in customer can only have payment_status = "paid"
2. Due/Partial requires valid customer_id (not null, not walk-in)
3. Partial payment: 0 < amount_paid < grand_total
4. Due payment: amount_paid = 0
5. Serial numbers must be available (not already sold)
6. Stock must be sufficient for quantity
7. If stock_id present, it must exist and belong to product_id

---

## Database Tables to Update

### 1. orders

```sql
INSERT: all order fields including due_amount
```

### 2. order_items

```sql
INSERT: each item from items array
```

### 3. products / stocks

```sql
UPDATE: quantity -= ordered_quantity
If stock_id: UPDATE stocks WHERE id = stock_id
Else: UPDATE products WHERE id = product_id
```

### 4. serial_numbers

```sql
UPDATE: status = 'sold', customer_id, order_id, sold_date
WHERE id IN (serial_ids)
```

### 5. customer_dues (create if not exists)

```sql
INSERT: customer_id, order_id, total_amount, paid_amount, due_amount
WHERE payment_status IN ('due', 'partial')
```

### 6. warranties (create if not exists)

```sql
INSERT: customer_id, order_id, product_id, warranty_plan_id,
        serial_number, start_date, end_date, status='active'
WHERE activate_warranty = true
```

---

## Sample SQL (Pseudo-code)

```sql
-- Create order
INSERT INTO orders (...) VALUES (...);
SET @order_id = LAST_INSERT_ID();

-- Create order items
FOREACH item IN items:
  INSERT INTO order_items (order_id, product_id, stock_id, quantity, ...);

  -- Update stock
  IF item.stock_id:
    UPDATE stocks SET quantity = quantity - item.quantity
    WHERE id = item.stock_id;
  ELSE:
    UPDATE products SET stock = stock - item.quantity
    WHERE id = item.product_id;

  -- Handle serials
  IF item.serial_ids:
    UPDATE serial_numbers SET status='sold', customer_id=@customer_id,
           order_id=@order_id, sold_date=NOW()
    WHERE id IN (item.serial_ids);

  -- Create warranty
  IF item.activate_warranty:
    SET @end_date = DATE_ADD(@start_date, INTERVAL plan.duration MONTH);
    INSERT INTO warranties (customer_id, order_id, product_id,
           warranty_plan_id, start_date, end_date, status)
    VALUES (@customer_id, @order_id, item.product_id,
           item.warranty_id, NOW(), @end_date, 'active');

-- Create due record if needed
IF payment_status IN ('due', 'partial'):
  INSERT INTO customer_dues (customer_id, order_id, total_amount,
         paid_amount, due_amount, status)
  VALUES (@customer_id, @order_id, @grand_total,
         @amount_paid, @due_amount,
         IF(payment_status='due', 'pending', 'partial'));
```

---

## Error Responses to Return

```json
// Insufficient stock
{
  "success": false,
  "message": "Insufficient stock for product: Product Name (Available: 5, Requested: 10)"
}

// Serial already sold
{
  "success": false,
  "message": "Serial number SN-1001 has already been sold"
}

// Walk-in cannot have due
{
  "success": false,
  "message": "Walk-in customers cannot have due or partial payment"
}

// Invalid partial amount
{
  "success": false,
  "message": "Partial payment amount must be between 0 and grand total"
}
```

---

## Success Response Format

```json
{
    "success": true,
    "message": "Order created successfully",
    "data": {
        "order_id": 12345,
        "invoice": {
            "invoice_number": "INV-2024-12345",
            "invoice_date": "2024-11-07",
            "invoice_url": "/invoices/12345.pdf"
        },
        "customer": {
            /* customer details */
        },
        "products": [
            /* product details */
        ],
        "totals": {
            /* amount details */
        },
        "payment_method": "cash",
        "payment_status": "paid"
    }
}
```

---

**For Complete Details:** See `BACKEND_ORDER_API_SPECIFICATION.md`

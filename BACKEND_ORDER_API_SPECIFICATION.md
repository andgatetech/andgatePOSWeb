# Backend Order API Specification

## Overview

This document specifies the complete data structure sent from frontend to backend when creating orders in the POS system.

---

## API Endpoint

**POST** `/api/orders/create`

---

## Request Body Structure

### Root Level Fields

```typescript
{
  // Basic Order Information
  user_id: number;              // ID of the user creating the order
  store_id: number;             // ID of the store

  // Payment Information
  payment_method: string;       // e.g., "cash", "card", "mobile banking"
  payment_status: string;       // "paid", "due", or "partial"

  // Financial Calculations
  tax: number;                  // Total tax amount (calculated from all items)
  discount: number;             // Total discount (includes regular + points + balance discounts)
  total: number;                // Subtotal without tax
  grand_total: number;          // Final total after all calculations
  amount_paid: number;          // Actual amount paid by customer
  change_amount: number;        // Change to return (for cash payments with status "paid")
  due_amount: number;           // Remaining amount (for "due" or "partial" status)

  // Customer Information (one of the following patterns)

  // Pattern 1: Walk-in Customer
  customer_id: null;
  is_walk_in: true;

  // Pattern 2: Existing Customer (from database)
  customer_id: number;          // Customer's database ID
  is_walk_in: false;

  // Pattern 3: New Customer (manual entry)
  customer_id: null;
  is_walk_in: false;
  customer_name: string;
  customer_number: string;
  customer_email: string;

  // Order Items Array
  items: OrderItem[];           // Array of order items (see below)
}
```

---

## Payment Status Logic

### 1. **"paid"** - Full Payment

-   **amount_paid**: Full grand_total (or cash amount received)
-   **change_amount**: Change to return (cash only)
-   **due_amount**: 0

**Example:**

```json
{
    "payment_status": "paid",
    "grand_total": 1000.0,
    "amount_paid": 1000.0,
    "change_amount": 0,
    "due_amount": 0
}
```

**Cash Payment Example:**

```json
{
    "payment_status": "paid",
    "payment_method": "cash",
    "grand_total": 1000.0,
    "amount_paid": 1500.0,
    "change_amount": 500.0,
    "due_amount": 0
}
```

---

### 2. **"due"** - Full Amount Unpaid

-   **amount_paid**: 0
-   **change_amount**: 0
-   **due_amount**: Full grand_total

**Requirements:**

-   ❌ NOT available for walk-in customers
-   ✅ Only for existing customers in database
-   Backend should record this as customer's due/receivable

**Example:**

```json
{
    "customer_id": 123,
    "payment_status": "due",
    "grand_total": 1000.0,
    "amount_paid": 0,
    "change_amount": 0,
    "due_amount": 1000.0
}
```

---

### 3. **"partial"** - Partial Payment

-   **amount_paid**: Partial amount paid
-   **change_amount**: 0
-   **due_amount**: Remaining amount (grand_total - amount_paid)

**Requirements:**

-   ❌ NOT available for walk-in customers
-   ✅ Only for existing customers in database
-   Backend should record remaining amount as customer's due

**Example:**

```json
{
    "customer_id": 123,
    "payment_status": "partial",
    "grand_total": 1000.0,
    "amount_paid": 400.0,
    "change_amount": 0,
    "due_amount": 600.0
}
```

---

## Order Item Structure

Each item in the `items` array can have the following structure:

### Base Item Fields

```typescript
{
    product_id: number; // Product database ID
    quantity: number; // Quantity ordered
    unit_price: number; // Price per unit
    unit: string; // Unit of measurement (e.g., "piece", "kg", "liter")
    discount: number; // Item-specific discount (currently 0)
    tax: number; // Tax percentage (e.g., 5 for 5%)
    tax_included: boolean; // Whether tax is included in unit_price
    subtotal: number; // Item total including tax
}
```

### Optional: Product Variants

If the product has variants (e.g., size, color):

```typescript
{
  ...baseFields,
  stock_id: number;             // Stock entry ID for the variant
}
```

**What backend should do:**

-   Use `stock_id` to identify which variant was sold
-   Update stock quantity for the specific variant
-   Record variant details in order history

---

### Optional: Serial Numbers

If the product has serial tracking:

```typescript
{
  ...baseFields,
  serial_ids: number[];         // Array of serial number IDs
}
```

**Example:**

```json
{
    "product_id": 456,
    "serial_ids": [1001, 1002, 1003],
    "quantity": 3
}
```

**What backend should do:**

-   Mark these serial numbers as sold
-   Associate serial numbers with this order
-   Update serial number status to "sold" in database
-   Link serial numbers to the customer for tracking

---

### Optional: Warranty Activation

If the product has warranty:

```typescript
{
  ...baseFields,
  warranty_id: number;          // Warranty plan ID
  activate_warranty: boolean;   // Should be true when present
}
```

**Example:**

```json
{
    "product_id": 789,
    "quantity": 1,
    "warranty_id": 5,
    "activate_warranty": true
}
```

**What backend should do:**

-   Create warranty record for this item
-   Link warranty to customer
-   Set warranty start date as order date
-   Calculate warranty expiry date based on warranty plan
-   Store warranty details for future claims

---

## Complete Example Scenarios

### Scenario 1: Walk-in Customer, Cash Payment, Simple Products

```json
{
    "user_id": 10,
    "store_id": 1,
    "payment_method": "cash",
    "payment_status": "paid",
    "tax": 50.0,
    "discount": 0,
    "total": 1000.0,
    "grand_total": 1050.0,
    "amount_paid": 1100.0,
    "change_amount": 50.0,
    "due_amount": 0,
    "customer_id": null,
    "is_walk_in": true,
    "items": [
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
    ]
}
```

---

### Scenario 2: Existing Customer, Partial Payment, Product with Variants

```json
{
    "user_id": 10,
    "store_id": 1,
    "customer_id": 45,
    "is_walk_in": false,
    "payment_method": "cash",
    "payment_status": "partial",
    "tax": 100.0,
    "discount": 50.0,
    "total": 2000.0,
    "grand_total": 2050.0,
    "amount_paid": 1000.0,
    "change_amount": 0,
    "due_amount": 1050.0,
    "items": [
        {
            "product_id": 202,
            "stock_id": 555,
            "quantity": 1,
            "unit_price": 2000.0,
            "unit": "piece",
            "discount": 0,
            "tax": 5,
            "tax_included": false,
            "subtotal": 2100.0
        }
    ]
}
```

**Backend Action:**

-   Create order record
-   Create order items
-   Update stock for variant (stock_id: 555)
-   Create customer due record: ৳1050.00
-   Link due to customer_id: 45

---

### Scenario 3: Existing Customer, Due Payment, Serial Tracked Product

```json
{
    "user_id": 10,
    "store_id": 1,
    "customer_id": 78,
    "is_walk_in": false,
    "payment_method": "bank_transfer",
    "payment_status": "due",
    "tax": 150.0,
    "discount": 0,
    "total": 3000.0,
    "grand_total": 3150.0,
    "amount_paid": 0,
    "change_amount": 0,
    "due_amount": 3150.0,
    "items": [
        {
            "product_id": 303,
            "quantity": 3,
            "unit_price": 1000.0,
            "unit": "piece",
            "discount": 0,
            "tax": 5,
            "tax_included": false,
            "subtotal": 3150.0,
            "serial_ids": [2001, 2002, 2003]
        }
    ]
}
```

**Backend Action:**

-   Create order record
-   Create order items
-   Mark serial numbers 2001, 2002, 2003 as sold
-   Link serial numbers to customer_id: 78
-   Create customer due record: ৳3150.00
-   Update product stock (-3)

---

### Scenario 4: New Customer, Paid, Product with Warranty

```json
{
    "user_id": 10,
    "store_id": 1,
    "customer_id": null,
    "is_walk_in": false,
    "customer_name": "John Doe",
    "customer_number": "+8801711111111",
    "customer_email": "john@example.com",
    "payment_method": "card",
    "payment_status": "paid",
    "tax": 200.0,
    "discount": 100.0,
    "total": 4000.0,
    "grand_total": 4100.0,
    "amount_paid": 4100.0,
    "change_amount": 0,
    "due_amount": 0,
    "items": [
        {
            "product_id": 404,
            "quantity": 1,
            "unit_price": 4000.0,
            "unit": "piece",
            "discount": 0,
            "tax": 5,
            "tax_included": false,
            "subtotal": 4200.0,
            "warranty_id": 3,
            "activate_warranty": true
        }
    ]
}
```

**Backend Action:**

-   Create new customer with provided details
-   Create order record linked to new customer
-   Create order items
-   Create warranty record:
    -   Link to customer
    -   Set start_date to order date
    -   Calculate end_date based on warranty plan (warranty_id: 3)
    -   Store product details for warranty tracking

---

### Scenario 5: Complex Order - Multiple Products with Different Features

```json
{
    "user_id": 10,
    "store_id": 1,
    "customer_id": 99,
    "is_walk_in": false,
    "payment_method": "cash",
    "payment_status": "partial",
    "tax": 350.0,
    "discount": 150.0,
    "total": 7000.0,
    "grand_total": 7200.0,
    "amount_paid": 3000.0,
    "change_amount": 0,
    "due_amount": 4200.0,
    "items": [
        {
            "product_id": 501,
            "stock_id": 801,
            "quantity": 2,
            "unit_price": 1500.0,
            "unit": "piece",
            "discount": 0,
            "tax": 5,
            "tax_included": false,
            "subtotal": 3150.0
        },
        {
            "product_id": 502,
            "quantity": 1,
            "unit_price": 2000.0,
            "unit": "piece",
            "discount": 0,
            "tax": 5,
            "tax_included": false,
            "subtotal": 2100.0,
            "serial_ids": [3001],
            "warranty_id": 2,
            "activate_warranty": true
        },
        {
            "product_id": 503,
            "stock_id": 802,
            "quantity": 1,
            "unit_price": 2000.0,
            "unit": "piece",
            "discount": 0,
            "tax": 5,
            "tax_included": false,
            "subtotal": 2100.0,
            "serial_ids": [3002]
        }
    ]
}

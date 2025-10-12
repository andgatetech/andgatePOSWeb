# Facebook Pixel Setup Guide - AndgatePOS

## ✅ Complete Setup Status

Your Facebook Pixel is now **FULLY CONFIGURED** and ready to work!

---

## 📋 What We Fixed

### 1. **Removed Duplicate Pixel Code** ✅

-   **Before**: Two Facebook Pixel scripts loading (one hardcoded, one from env)
-   **After**: Single pixel loading from environment variable
-   **Location**: `app/layout.tsx`

### 2. **Added Full Tracking Functions** ✅

-   Created comprehensive tracking helpers in `lib/analytics.ts`
-   All Facebook standard events supported
-   Custom POS-specific events added

### 3. **Environment Variable Setup** ✅

-   Updated `.env.example` with your Pixel ID: `1803836553585330`
-   Added conditional loading (only loads if ID exists)
-   Added noscript fallback for users with JavaScript disabled

---

## 🚀 How to Make It Work

### Step 1: Create Environment File

Create a file named `.env.local` in your project root:

```bash
# Copy .env.example to .env.local
cp .env.example .env.local
```

### Step 2: Add Your Facebook Pixel ID

Open `.env.local` and make sure this line exists:

```bash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1803836553585330
```

> **Note**: Replace `1803836553585330` with your actual Facebook Pixel ID if different.

### Step 3: Restart Your Development Server

```bash
# Stop your current server (Ctrl+C)
# Then restart it
npm run dev
```

---

## 📊 Available Tracking Functions

### Import in Your Components

```typescript
import {
    trackFBPageView,
    trackFBPurchase,
    trackFBAddToCart,
    trackFBLead,
    trackFBCompleteRegistration,
    trackFBInitiateCheckout,
    trackFBSearch,
    trackFBViewContent,
    trackFBContact,
    trackFBOrderPlaced,
    trackFBInventoryUpdate,
    trackFBStoreCreated,
} from '@/lib/analytics';
```

### Standard Facebook Events

#### 1. **Page View** (Automatic)

Already tracked automatically on every page load.

#### 2. **Purchase** (For Order Completion)

```typescript
// When a customer completes a purchase
trackFBPurchase({
    value: 1500.5, // Total amount
    currency: 'BDT', // Currency (default: BDT)
    transactionId: 'ORD-123', // Order/Invoice number
    numItems: 5, // Number of items
});
```

#### 3. **Add to Cart** (When Adding Products)

```typescript
// When customer adds item to cart/order
trackFBAddToCart({
    id: 'PROD-001', // Product ID
    name: 'Product Name', // Product name
    value: 299.99, // Product price
    currency: 'BDT', // Currency
});
```

#### 4. **Initiate Checkout** (When Starting Order)

```typescript
// When customer starts checkout process
trackFBInitiateCheckout({
    value: 1200.0, // Total cart value
    currency: 'BDT',
    numItems: 3, // Number of items
});
```

#### 5. **Lead** (For New Customer Inquiries)

```typescript
// When someone shows interest/contact form
trackFBLead({
    value: 0, // Optional: estimated value
    currency: 'BDT',
    contentName: 'Contact Form', // Where lead came from
});
```

#### 6. **Complete Registration** (New User Signup)

```typescript
// When new user creates account
trackFBCompleteRegistration('email'); // or 'phone', 'social'
```

#### 7. **Search** (Product/Inventory Search)

```typescript
// When user searches for products
trackFBSearch('laptop computers');
```

#### 8. **View Content** (Product Details)

```typescript
// When viewing product details
trackFBViewContent({
    id: 'PROD-001',
    name: 'Laptop',
    value: 45000,
    currency: 'BDT',
});
```

#### 9. **Contact** (Contact Page/Support)

```typescript
// When user initiates contact
trackFBContact();
```

### Custom POS Events

#### 10. **Order Placed** (POS Specific)

```typescript
// Track POS orders with payment method
trackFBOrderPlaced({
    orderId: 'INV-1-00034',
    value: 2500.0,
    items: 10,
    paymentMethod: 'cash', // cash, card, mobile
});
```

#### 11. **Inventory Update**

```typescript
// Track inventory changes
trackFBInventoryUpdate('PROD-001', 'add'); // Product added
trackFBInventoryUpdate('PROD-002', 'update'); // Product updated
trackFBInventoryUpdate('PROD-003', 'delete'); // Product deleted
```

#### 12. **Store Created**

```typescript
// Track when new store is created
trackFBStoreCreated('Downtown Branch');
```

---

## 💡 Usage Examples in Your POS System

### Example 1: Track Order in PosRightSide.tsx

```typescript
import { trackFBPurchase, trackFBOrderPlaced } from '@/lib/analytics';

// After successful order creation
const handleCreateOrder = async () => {
    // ... your order creation logic

    const orderResponse = await createOrder(orderData).unwrap();

    // Track Facebook Pixel Purchase
    trackFBPurchase({
        value: totalAmount,
        currency: 'BDT',
        transactionId: orderResponse.data.invoice,
        numItems: cartItems.length,
    });

    // Track custom POS event
    trackFBOrderPlaced({
        orderId: orderResponse.data.invoice,
        value: totalAmount,
        items: cartItems.length,
        paymentMethod: formData.paymentMethod,
    });
};
```

### Example 2: Track Product View

```typescript
import { trackFBViewContent } from '@/lib/analytics';

// When viewing product details
const handleViewProduct = (product) => {
    trackFBViewContent({
        id: product.id,
        name: product.name,
        value: product.price,
        currency: 'BDT',
    });
};
```

### Example 3: Track New Customer Registration

```typescript
import { trackFBCompleteRegistration, trackFBLead } from '@/lib/analytics';

// After successful registration
const handleRegister = async (userData) => {
    const response = await registerUser(userData).unwrap();

    // Track registration
    trackFBCompleteRegistration('email');

    // Also track as lead
    trackFBLead({
        contentName: 'User Registration',
    });
};
```

### Example 4: Track Search Activity

```typescript
import { trackFBSearch } from '@/lib/analytics';

// In your search component
const handleSearch = (searchTerm: string) => {
    // Your search logic
    setSearchQuery(searchTerm);

    // Track search
    trackFBSearch(searchTerm);
};
```

---

## 🧪 Testing Your Facebook Pixel

### Method 1: Facebook Pixel Helper (Browser Extension)

1. Install **Facebook Pixel Helper** extension:

    - [Chrome](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
    - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/facebook-pixel-helper/)

2. Visit your website
3. Click the extension icon
4. You should see: **Pixel ID: 1803836553585330** with green checkmark

### Method 2: Facebook Events Manager

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel
3. Click **Test Events** tab
4. Visit your website
5. You should see events appearing in real-time

### Method 3: Browser Console

Open browser console (F12) and type:

```javascript
fbq;
```

You should see a function, not `undefined`.

---

## ✨ What Events Are Tracked Automatically?

1. **PageView** - Every page navigation
2. All events you manually trigger using the tracking functions above

---

## 🔍 Verify Setup

### Check 1: Environment Variable Loaded

```typescript
// In any component, log this:
console.log('FB Pixel ID:', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID);
// Should output: 1803836553585330
```

### Check 2: fbq Function Available

```javascript
// In browser console:
typeof window.fbq;
// Should output: "function"
```

### Check 3: Pixel Fires on Page Load

```javascript
// In browser console Network tab:
// Filter by "facebook.com"
// You should see request to "fbevents.js"
```

---

## 📁 Files Modified

1. **`app/layout.tsx`**

    - Removed duplicate/hardcoded pixel
    - Added conditional loading
    - Added noscript fallback

2. **`lib/analytics.ts`**

    - Added all Facebook Pixel tracking functions
    - Added TypeScript declarations
    - Added custom POS events

3. **`.env.example`**
    - Updated with correct Facebook Pixel ID
    - Added helpful comments

---

## 🎯 Next Steps

### Immediate Actions:

1. ✅ Create `.env.local` with your Pixel ID
2. ✅ Restart development server
3. ✅ Test with Facebook Pixel Helper extension
4. ✅ Add tracking calls to your key user actions:
    - Order creation
    - Product views
    - User registration
    - Search functionality

### Recommended Tracking Points:

| Action                | Function to Use               | Priority    |
| --------------------- | ----------------------------- | ----------- |
| Order Completed       | `trackFBPurchase`             | 🔴 Critical |
| Product Added to Cart | `trackFBAddToCart`            | 🔴 Critical |
| Checkout Started      | `trackFBInitiateCheckout`     | 🟡 High     |
| User Registration     | `trackFBCompleteRegistration` | 🟡 High     |
| Product Search        | `trackFBSearch`               | 🟢 Medium   |
| Contact Form          | `trackFBLead`                 | 🟢 Medium   |
| Product View          | `trackFBViewContent`          | 🟢 Medium   |

---

## 🐛 Troubleshooting

### Pixel Not Loading?

**Check 1**: Environment variable set?

```bash
# In terminal
echo $NEXT_PUBLIC_FACEBOOK_PIXEL_ID
```

**Check 2**: Server restarted after adding `.env.local`?

```bash
npm run dev
```

**Check 3**: Browser console errors?

-   Open DevTools (F12)
-   Look for errors related to "fbq" or "facebook"

### Events Not Showing in Facebook?

-   Events can take 15-30 minutes to appear in Facebook Analytics
-   Use "Test Events" for real-time testing
-   Make sure you're looking at the correct Pixel ID

### Pixel Helper Shows Red X?

-   Clear browser cache
-   Disable ad blockers
-   Check if Pixel ID matches in `.env.local`

---

## 📞 Support

If you need help:

1. Check Facebook's [Pixel Setup Guide](https://www.facebook.com/business/help/952192354843755)
2. Use [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) for debugging
3. Review Events Manager for error messages

---

## ✅ Checklist

-   [ ] Created `.env.local` file
-   [ ] Added `NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1803836553585330`
-   [ ] Restarted development server
-   [ ] Installed Facebook Pixel Helper extension
-   [ ] Verified Pixel loads (green checkmark in extension)
-   [ ] Added tracking to order creation
-   [ ] Added tracking to product views
-   [ ] Added tracking to user registration
-   [ ] Tested events in Facebook Events Manager

---

**Your Facebook Pixel is now production-ready! 🎉**

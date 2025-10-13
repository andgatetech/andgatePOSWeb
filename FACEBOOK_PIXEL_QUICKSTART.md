# 🚀 Quick Start - Facebook Pixel

## STEP 1: Create Environment File

```bash
# In your project root, create .env.local file:
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1803836553585330
```

## STEP 2: Restart Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## STEP 3: Verify It Works

-   Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
-   Visit your website
-   Click extension - should show green checkmark ✅

---

## 📊 Most Important Tracking (Add These First)

### 1. Track Orders (CRITICAL)

**File**: `app/(defaults)/(apps)/pos/PosRightSide.tsx`

```typescript
import { trackFBPurchase } from '@/lib/analytics';

// After order created successfully
trackFBPurchase({
    value: totalAmount,
    transactionId: orderResponse.data.invoice,
    numItems: cartItems.length,
});
```

### 2. Track Registration

**File**: Your registration component

```typescript
import { trackFBCompleteRegistration } from '@/lib/analytics';

// After successful registration
trackFBCompleteRegistration('email');
```

### 3. Track Add to Cart

**File**: Where you add products to cart

```typescript
import { trackFBAddToCart } from '@/lib/analytics';

trackFBAddToCart({
    id: product.id,
    name: product.name,
    value: product.price,
});
```

---

## ✅ All Done!

See `FACEBOOK_PIXEL_SETUP.md` for complete documentation.

# Universal Filter System

A comprehensive, reusable filter system for your Next.js application that provides search, store filtering, date range filtering, and custom filters across different data types.

## Features

-   🔍 **Universal Search** - Text-based search across any data type
-   🏪 **Store Filtering** - Filter by specific stores or all stores from Redux
-   📅 **Date Range Filtering** - Today, Yesterday, This Week, Custom ranges, etc.
-   🎛️ **Custom Filters** - Extensible system for entity-specific filters
-   🔄 **Auto API Integration** - Automatically builds API parameters
-   💾 **Redux Integration** - Uses current store from Redux state
-   🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
-   ♻️ **Fully Reusable** - Works across Products, Orders, Categories, etc.

## Quick Start

### 1. Basic Usage

```tsx
import UniversalFilter from '@/components/common/UniversalFilter';

const MyComponent = () => {
    const handleFilterChange = (filters) => {
        console.log('Filters changed:', filters);
        // Make your API call here
    };

    return <UniversalFilter onFilterChange={handleFilterChange} placeholder="Search..." showStoreFilter={true} showDateFilter={true} showSearch={true} />;
};
```

### 2. With Custom Hook

```tsx
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import UniversalFilter from '@/components/common/UniversalFilter';

const MyComponent = () => {
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter({
        onFilterChange: (filters) => {
            const apiParams = buildApiParams();
            // Make API call with apiParams
            fetchData(apiParams);
        },
    });

    return <UniversalFilter onFilterChange={handleFilterChange} placeholder="Search products..." />;
};
```

## Pre-built Filter Components

### ProductFilter

```tsx
import ProductFilter from '@/components/filters/ProductFilter';

const ProductsPage = () => {
    const handleFilterChange = (apiParams) => {
        // apiParams includes: search, store_id, date ranges, category_id, status
        fetchProducts(apiParams);
    };

    return <ProductFilter onFilterChange={handleFilterChange} categories={categories} />;
};
```

### OrderFilter

```tsx
import OrderFilter from '@/components/filters/OrderFilter';

const OrdersPage = () => {
    const handleFilterChange = (apiParams) => {
        // apiParams includes: search, store_id, date ranges, payment_method, order_status, min_amount, max_amount
        fetchOrders(apiParams);
    };

    return <OrderFilter onFilterChange={handleFilterChange} />;
};
```

### CategoryFilter

```tsx
import CategoryFilter from '@/components/filters/CategoryFilter';

const CategoriesPage = () => {
    const handleFilterChange = (apiParams) => {
        // apiParams includes: search, store_id, date ranges, status, visibility
        fetchCategories(apiParams);
    };

    return <CategoryFilter onFilterChange={handleFilterChange} />;
};
```

## API Parameters Generated

The filter system automatically generates these API parameters:

### Universal Parameters (Available in all filters)

-   `search` - Text search term
-   `store_id` - Selected store ID
-   `store_ids` - "all" when all stores selected
-   `start_date` - Date range start (YYYY-MM-DD HH:mm:ss)
-   `end_date` - Date range end (YYYY-MM-DD HH:mm:ss)
-   `date_filter_type` - Type of date filter applied

### Entity-Specific Parameters

**Products:**

-   `category_id` - Product category ID
-   `status` - Product status (active, inactive, out_of_stock)

**Orders:**

-   `payment_method` - Payment method (cash, card, mobile_payment, bank_transfer)
-   `order_status` - Order status (pending, confirmed, processing, completed, cancelled, refunded)
-   `min_amount` - Minimum order amount
-   `max_amount` - Maximum order amount

**Categories:**

-   `status` - Category status (active, inactive)
-   `visibility` - Category visibility (public, private, hidden)

## Creating Custom Filters

### 1. Create a Custom Filter Component

```tsx
import React from 'react';
import UniversalFilter, { FilterOptions } from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';

interface CustomFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const CustomFilter: React.FC<CustomFilterProps> = ({ onFilterChange }) => {
    const [customField, setCustomField] = React.useState<string>('');

    const { handleFilterChange, buildApiParams } = useUniversalFilter({
        onFilterChange: (filters: FilterOptions) => {
            const apiParams = buildApiParams({
                custom_field: customField || undefined,
            });
            onFilterChange(apiParams);
        },
    });

    const customFilters = (
        <div className="relative">
            <select value={customField} onChange={(e) => setCustomField(e.target.value)} className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900">
                <option value="">All Options</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
            </select>
        </div>
    );

    return <UniversalFilter onFilterChange={handleFilterChange} placeholder="Search custom data..." customFilters={customFilters} />;
};
```

### 2. Backend Integration Example

```php
// Laravel Controller Example
public function index(Request $request)
{
    $query = YourModel::query();

    // Handle search
    if ($request->has('search')) {
        $query->where('name', 'like', '%' . $request->search . '%');
    }

    // Handle store filtering
    if ($request->has('store_id')) {
        $query->where('store_id', $request->store_id);
    } elseif ($request->has('store_ids') && $request->store_ids === 'all') {
        // Get all user stores and filter
        $userStores = auth()->user()->stores->pluck('id');
        $query->whereIn('store_id', $userStores);
    }

    // Handle date filtering
    if ($request->has('start_date') && $request->has('end_date')) {
        $query->whereBetween('created_at', [
            $request->start_date,
            $request->end_date
        ]);
    }

    return $query->paginate(15);
}
```

```javascript
// Node.js/Express Example
app.get('/api/products', (req, res) => {
    let query = db.select('*').from('products');

    // Handle search
    if (req.query.search) {
        query = query.where('name', 'like', `%${req.query.search}%`);
    }

    // Handle store filtering
    if (req.query.store_id) {
        query = query.where('store_id', req.query.store_id);
    } else if (req.query.store_ids === 'all') {
        // Handle all stores case
        const userStoreIds = getUserStoreIds(req.user.id);
        query = query.whereIn('store_id', userStoreIds);
    }

    // Handle date filtering
    if (req.query.start_date && req.query.end_date) {
        query = query.whereBetween('created_at', [req.query.start_date, req.query.end_date]);
    }

    query.then((results) => res.json(results));
});
```

## Configuration Options

### UniversalFilter Props

| Prop              | Type                               | Default     | Description                |
| ----------------- | ---------------------------------- | ----------- | -------------------------- |
| `onFilterChange`  | `(filters: FilterOptions) => void` | Required    | Called when filters change |
| `placeholder`     | `string`                           | "Search..." | Search input placeholder   |
| `showStoreFilter` | `boolean`                          | `true`      | Show/hide store dropdown   |
| `showDateFilter`  | `boolean`                          | `true`      | Show/hide date filter      |
| `showSearch`      | `boolean`                          | `true`      | Show/hide search input     |
| `customFilters`   | `React.ReactNode`                  | `undefined` | Custom filter components   |
| `initialFilters`  | `FilterOptions`                    | `{}`        | Initial filter values      |
| `className`       | `string`                           | `""`        | Additional CSS classes     |

### Date Filter Types

-   `today` - Today only
-   `yesterday` - Yesterday only
-   `this_week` - Current week (Monday to Sunday)
-   `last_week` - Previous week
-   `this_month` - Current month
-   `last_month` - Previous month
-   `this_year` - Current year
-   `last_year` - Previous year
-   `custom` - Custom date range with date pickers

## Dependencies

-   `date-fns` - For date manipulation
-   `lucide-react` - For icons
-   `tailwindcss` - For styling
-   `@reduxjs/toolkit` - For Redux state management

## Installation

1. Install required dependencies:

```bash
npm install date-fns lucide-react
```

2. Copy the filter components to your project:

-   `components/common/UniversalFilter.tsx`
-   `hooks/useUniversalFilter.ts`
-   `components/filters/` (ProductFilter, OrderFilter, CategoryFilter)

3. Use in your components as shown in the examples above.

## Best Practices

1. **Debounce Search**: Consider debouncing search input to avoid excessive API calls
2. **Caching**: Implement caching for filter options that don't change often
3. **URL Sync**: Sync filter state with URL parameters for bookmarkable results
4. **Loading States**: Show loading indicators during filter operations
5. **Error Handling**: Handle API errors gracefully
6. **Performance**: Use pagination with filters for large datasets

## Examples

See `components/examples/FilterExamplesPage.tsx` for a complete working example demonstrating all filter types.

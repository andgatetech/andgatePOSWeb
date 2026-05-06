# workflows/main_flow.md

Step-by-step workflows for the most common development tasks in this codebase.

---

## Workflow 1 — Translate a Page Component

Use this for any component under `app/(application)/` that still has hardcoded English strings.

```
1. Read the target component file
2. Find all hardcoded strings (button labels, headings, error messages, placeholders, tooltips)
3. Design key names:
   - Buttons:        btn_<action>          (btn_save, btn_cancel, btn_delete)
   - Labels:         lbl_<field>           (lbl_name, lbl_email, lbl_status)
   - Messages:       msg_<context>         (msg_delete_confirm, msg_no_records_yet)
   - Placeholders:   placeholder_<field>   (placeholder_search, placeholder_enter_name)
   - Titles:         <module>_title        (products_title, orders_page_title)
4. Add const { t } = getTranslation() at TOP of component function body
5. Replace each hardcoded string with t('key')
6. Add all new keys to public/locales/en.json (English value)
7. Add all new keys to public/locales/bn.json (Bengali translation)
8. Validate JSON:
   python3 -c "import json; json.load(open('public/locales/en.json'))"
   python3 -c "import json; json.load(open('public/locales/bn.json'))"
9. Grep to verify no keys were missed:
   grep -o "t('[^']*')" <file> | sort -u
   Then confirm each key exists in en.json
10. Mark the component done in context/TASKS.md
```

**Critical:** Never call `getTranslation()` inside `.map()`, `useCallback`, or helper functions. Move it to the component body top and pass `t` as needed.

---

## Workflow 2 — Add a New Page

```
1. Create the page file:
   app/(application)/(protected)/<route>/page.tsx

2. Add 'use client' directive (required for most protected pages)

3. Add permission check if the route requires a specific permission:
   a. Add the route to ROUTE_PERMISSIONS in lib/permissions.ts
      '<route>': ['<permission.string>']
   b. Test that users without the permission are redirected to /dashboard

4. Add to sidebar menu (if user-navigable):
   a. Add entry to ALL_MENU_ITEMS in lib/menu-builder.tsx
   b. Add the exact label string as an i18n key to both locale files
      (Sidebar uses t(route.label) directly)

5. Add RTK Query endpoint if new data is needed:
   a. Create or extend store/features/<Resource>/<Resource>Api.ts
   b. Add tag to baseApi.tagTypes in store/api/baseApi.ts
   c. Follow providesTags / invalidatesTags pattern from existing endpoints

6. Translate all strings in the new page (see Workflow 1)

7. Test:
   - Log in as a user with the required permission → page accessible
   - Log in as a user without permission → redirected to /dashboard
   - Switch languages → all strings translate
```

---

## Workflow 3 — Add an API Endpoint

```
1. Open store/features/<Resource>/<Resource>Api.ts
   (Create the file if the resource is new)

2. Add the endpoint inside baseApi.injectEndpoints:

   export const resourceApi = baseApi.injectEndpoints({
     endpoints: (builder) => ({
       getResources: builder.query<ResponseType, { store_id: number }>({
         query: ({ store_id }) => `/resources?store_id=${store_id}`,
         providesTags: ['Resources'],
       }),
       createResource: builder.mutation<ResponseType, CreatePayload>({
         query: (body) => ({ url: '/resources', method: 'POST', body }),
         invalidatesTags: ['Resources'],
       }),
     }),
   });

   export const { useGetResourcesQuery, useCreateResourceMutation } = resourceApi;

3. Add the tag string to baseApi.tagTypes in store/api/baseApi.ts:
   tagTypes: [...existingTags, 'Resources']

4. Always include store_id in store-scoped queries:
   const { currentStoreId } = useCurrentStore();
   useGetResourcesQuery({ store_id: currentStoreId })

5. For subscription-limited endpoints, wrap error:
   const { error } = useGetResourcesQuery(...);
   const subscriptionError = useSubscriptionError(error);
```

---

## Workflow 4 — Add a Permission

```
1. Backend defines the permission string (e.g., 'inventory.transfers')

2. Add to lib/permissionConfig.ts:
   'inventory.transfers': {
     label: 'Inventory Transfers',
     color: 'primary',
     sidebarLabel: 'Transfers',
   }

3. Add to ROUTE_PERMISSIONS in lib/permissions.ts:
   '/products/transfers': ['inventory.transfers']

4. Add to ALL_MENU_ITEMS in lib/menu-builder.tsx with the permission:
   { label: 'Transfers', href: '/products/transfers', permission: 'inventory.transfers', ... }

5. Add the label as an i18n key to both locale files (see Workflow 2, step 4b)

6. Gate UI elements in components:
   import { hasAnyPermission } from '@/lib/permissions';
   const userPerms = useSelector(state => state.auth.user?.permissions ?? []);
   if (!hasAnyPermission(userPerms, ['inventory.transfers'])) return null;
```

---

## Workflow 5 — Add a New Locale Key

Minimal workflow for adding a single key.

```
1. Choose a key name following the naming convention (btn_, lbl_, msg_, placeholder_)
2. Add to public/locales/en.json at the appropriate position (alphabetical by prefix group)
3. Add the Bengali translation to public/locales/bn.json at the same position
4. Validate both files:
   python3 -c "import json; json.load(open('public/locales/en.json'))"
   python3 -c "import json; json.load(open('public/locales/bn.json'))"
5. Use t('your_new_key') in the component
```

---

## Workflow 6 — Debug a Missing Translation (Raw Key on Screen)

When a raw key string (e.g., `purchase_title`) appears in the UI instead of the translated text:

```
1. Identify which component renders that text:
   grep -rn "purchase_title" app/ components/ --include="*.tsx"

2. Check if the key exists in en.json:
   python3 -c "import json; d=json.load(open('public/locales/en.json')); print(d.get('purchase_title', 'MISSING'))"

3. If missing → add to both locale files, validate JSON

4. If present → check getTranslation() placement in the component:
   - Is it called at top of component? ✓
   - Is it called inside .map() or a callback? ✗ — move to component body

5. Reload the page and verify the key resolves
```

---

## Workflow 7 — Switch Active Store During Development

The UI defaults to Bengali. To work in English locally:

```
1. Open browser DevTools → Application → Cookies
2. Set cookie: i18nextLng = en
3. Reload the page

To test store switching:
- Log in as a user with multiple stores
- Use the sidebar store switcher
- Verify currentStoreId changes in Redux DevTools
- Verify API calls include the new store_id
```

# Remove Mocks Audit

Branch: `feature/remove-mocks-real-data`

## Runtime Mock Inventory

| File | Mock or seed found | Runtime risk | Replacement applied in this phase |
| --- | --- | --- | --- |
| `src/lib/offline/db.ts` | Development financial seed transactions (`seed-tx-*`) | New sessions can see fake income/expense data if local DB is empty and no token exists yet. | Remove financial transaction seeding. Dexie becomes cache plus pending mutation storage only. |
| `src/lib/offline/db.ts` | Development fixed expense seeds (`seed-fixed-*`) | Dashboard forecast can show fake rent, internet and streaming commitments. | Remove fixed expense seeding. Empty users get empty forecast states. |
| `src/lib/offline/db.ts` | `initialSeedComplete` setting drives data/demo bootstrap | Keeps demo bootstrap behavior in runtime database lifecycle. | Replace with cache metadata only. |
| `src/lib/offline/db.ts` | Imports `initialCategories` from `categoryStore` and writes them to Dexie | Category source is frontend hardcoded data. | Categories should come from API, then be cached locally. |
| `src/stores/categoryStore.ts` | `initialCategories` hardcoded category list | Runtime pages/forms depend on frontend mock catalog. | Move category defaults to API response and hydrate store/cache from API. |
| `src/pages/CategoriesPage.tsx` | Copy says “Fuentes mock...” | User-facing UI exposes mock behavior. | Replace copy with real empty/loading/error states and API-backed categories. |
| `src/pages/DashboardPage.tsx` | Uses local Dexie data that can be seeded by mocks | Dashboard can look populated for a new user. | Hydrate from API/sync pull first when authenticated; show empty states if API has no records. |
| `src/stores/transactionStore.ts` | `monthlyBudget` fallback `15000` from local setting | User profile budget can be represented as a local default. | Keep as neutral app default only until profile/dashboard data is available; no financial records invented. |
| `src/stores/fixedExpenseStore.ts` | Reads fixed expenses from Dexie, which may be seeded | Fixed expenses screen can show demo commitments. | Stop seeding and refresh from authenticated remote pull/cache. |

## Test Fixture Inventory

The following mocks/examples are allowed as test fixtures and must not be imported by runtime pages, stores or services:

- `src/**/*.test.ts`
- `src/**/*.test.tsx`
- `src/test/**`

## Runtime Rule

Runtime code under `src/pages`, `src/stores`, `src/services`, `src/lib/offline` and `src/lib/remote` must not import mock data files. Test fixtures may live under `src/test/fixtures`.

## Applied Changes

- Removed runtime financial seed generation from `src/lib/offline/db.ts`.
- Converted Dexie into cache/sync storage for real API data and pending local mutations.
- Added `currentUserId` cache metadata so switching authenticated users clears sensitive cached financial data.
- Replaced frontend category defaults with authenticated `GET /v1/categories` hydration plus Dexie cache.
- Added API services for transactions, fixed expenses, dashboard summary and categories.
- Added real empty states for dashboard, history, categories and fixed expenses.
- Added tests that verify API client bearer auth, 401 handling, empty dashboard state, fixed expenses empty state and no runtime imports from mock/fixture modules.

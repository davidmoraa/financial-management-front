# Branch Consolidation and Income Cadence Planning

## Status

Implemented as repository/process consolidation. Income cadence is documented as the next forecast design input, not implemented in runtime yet.

## Goal

Unify the active frontend feature history under the Jomi-style branch standard and record the product consideration that budget expectations must support users paid weekly or biweekly.

## Branch Analysis

Current frontend history is linear:

```txt
main/develop
  -> feature/offline-first-pwa
  -> feature/api-sync-foundation
  -> feature/fixed-expenses-forecast
  -> feature/oauth-social-auth
  -> feature/remove-mocks-real-data
```

`feature/remove-mocks-real-data` contains all previous completed frontend phases.

## What Changed

- Added `GIT_STANDARDS.md` adapted to Money Flux.
- Prepared this feature tracking document.
- Documented that branch consolidation should fast-forward `develop` and `main` to `feature/remove-mocks-real-data` after verification.

## Income Cadence Consideration

The current forecast is monthly-budget based. That is not enough for users whose expected cash flow arrives:

- weekly;
- biweekly/quincenal;
- monthly;
- custom paydays.

The next forecast model should separate:

- real income transactions already registered;
- expected income schedule used only for planning;
- spending budget cycle derived from pay cadence;
- fixed expense due windows allocated to the relevant pay cycle.

Recommended frontend UX:

- During setup/settings ask: `¿Cada cuándo recibes ingresos?`
- Options: weekly, biweekly/quincenal, monthly, custom.
- For quincenal, allow common patterns:
  - day 15 and last day of month;
  - day 1 and day 15;
  - custom two days.
- Dashboard should show both monthly forecast and current income-cycle forecast.

Recommended forecast outputs:

- current cycle start/end;
- expected income in current cycle;
- pending expected income before cycle end;
- fixed expenses due before next payday;
- safe daily spend until next payday;
- monthly safe daily spend remains available as secondary context.

## Database Impact

No frontend schema change in this consolidation.

Future API-backed data likely needs an `income_sources` model and optional `income_occurrences`, owned by the API.

## SQL Procedures

None.

## Verification

Previous frontend verification before consolidation:

```bash
npm test
npm run build
```

Both passed before this documentation pass.

## Known Boundaries

- This pass does not implement income source CRUD.
- This pass does not change forecast runtime calculations.
- This pass does not delete historical feature branches.

## Follow-up Candidates

- `feature/income-cadence-forecast`
- Add income source API and IndexedDB cache.
- Extend forecast engine with cycle-aware budget expectations.
- Add setup/settings UI for pay cadence and expected income.

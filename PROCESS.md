# Quote-to-Delivery Process (Internal)

The customer lifecycle implemented in `src/lib/customer-state.ts`. Every
account carries a `customerState`; every transition is recorded in the
`status_event` table (who moved, from what, to what, when, with a note).

## Pipeline

| # | State | Meaning | Moves forward when |
|---|-------|---------|--------------------|
| 1 | `LEAD` | Quote form submitted (pins, files, description attached) | We reply |
| 2 | `PENDING_QUOTE` | **Preliminary quote** (or info request) sent | Customer accepts the number |
| 3 | `IN_DESIGN` | Digital drawing in progress — **AutoCAD**; **SketchUp** 3D model when the design needs 3D to be properly appreciated | Drawing delivered |
| 4 | `DESIGN_REVIEW` | Design handed to customer for approval | Customer approves (revisions loop back to `IN_DESIGN`) |
| 5 | `PENDING_DEPOSIT` | **50% deposit** requested + **contract** sent (the shop's existing standard contract governs terms, balances, and expectations — the site does not model or restate it) | Deposit received & contract signed |
| 6 | `DEPOSIT_RECEIVED` | Project queued | Build starts |
| 7 | `IN_PRODUCTION` | On the bench | Build finished |
| 8 | `READY_FOR_DELIVERY` | Delivery/pickup coordination + remaining balance | Delivered & paid |
| 9 | `COMPLETED` | Done | — |

Off-ramps: `DECLINED` (customer or shop passes — can return to `LEAD` on a
new request) and `ARCHIVED` (stale/inactive).

## Rules encoded in `customer-state.ts`

- `canTransition(from, to)` — the only legal moves are the ones above;
  anything driving state changes (future admin dashboard, automations)
  must go through it.
- `DESIGN_REVIEW -> IN_DESIGN` is a legal loop for revision rounds.
- A returning customer's new form submission resets them to `LEAD` and
  logs the transition.

## Not yet built (future iterations)

- Admin dashboard to move customers through states (today: direct DB edit).
- Email notifications on state change (blocked on picking an email provider).
- Contract e-sign / deposit payment integration — the paper contract and
  payment handling stay manual for now, by design.

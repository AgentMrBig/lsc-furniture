/**
 * Customer lifecycle state machine.
 *
 * Mirrors the real shop process:
 *  1. Quote form submitted                             -> LEAD
 *  2. We reply with a preliminary quote (or questions) -> PENDING_QUOTE
 *  3. Customer accepts the preliminary quote           -> IN_DESIGN
 *     (digital drawing produced in AutoCAD; SketchUp when the design
 *      needs 3D to be properly appreciated)
 *  4. Drawing handed to the customer for approval      -> DESIGN_REVIEW
 *     (revisions loop back to IN_DESIGN)
 *  5. Design approved -> 50% deposit + signed contract -> PENDING_DEPOSIT
 *     (the shop's existing standard contract governs terms, balances,
 *      and expectations — not modeled in code)
 *  6. Deposit received & contract signed               -> DEPOSIT_RECEIVED
 *  7. Build                                            -> IN_PRODUCTION
 *  8. Done, awaiting delivery/pickup + final balance   -> READY_FOR_DELIVERY
 *  9. Delivered and paid in full                       -> COMPLETED
 *
 * Use `canTransition` to enforce legal moves so future iterations
 * (admin dashboard, notifications, automations) can hang behavior off
 * each state.
 */
export const CUSTOMER_STATES = [
  "LEAD", // form submitted — customer (potential)
  "PENDING_QUOTE", // preliminary quote or info request sent
  "IN_DESIGN", // quote accepted; AutoCAD/SketchUp drawing in progress
  "DESIGN_REVIEW", // drawing delivered, awaiting customer approval
  "PENDING_DEPOSIT", // design approved; awaiting 50% deposit + signed contract
  "DEPOSIT_RECEIVED", // deposit in hand & contract signed, project queued
  "IN_PRODUCTION", // actively being built
  "READY_FOR_DELIVERY", // build complete; delivery/pickup + final balance
  "COMPLETED", // delivered and paid in full
  "DECLINED", // customer declined (quote or design) or we declined the job
  "ARCHIVED", // inactive/stale lead
] as const;

export type CustomerState = (typeof CUSTOMER_STATES)[number];

export const STATE_LABELS: Record<CustomerState, string> = {
  LEAD: "Customer (potential)",
  PENDING_QUOTE: "Customer (pending quote)",
  IN_DESIGN: "In design",
  DESIGN_REVIEW: "Design review",
  PENDING_DEPOSIT: "Customer (pending deposit)",
  DEPOSIT_RECEIVED: "Customer (deposit received)",
  IN_PRODUCTION: "In production",
  READY_FOR_DELIVERY: "Ready for delivery",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  ARCHIVED: "Archived",
};

/** Short labels used in the portal's progress timeline. */
export const STATE_SHORT: Record<CustomerState, string> = {
  LEAD: "Request",
  PENDING_QUOTE: "Quote",
  IN_DESIGN: "Design",
  DESIGN_REVIEW: "Approval",
  PENDING_DEPOSIT: "Deposit",
  DEPOSIT_RECEIVED: "Queued",
  IN_PRODUCTION: "Build",
  READY_FOR_DELIVERY: "Delivery",
  COMPLETED: "Done",
  DECLINED: "Declined",
  ARCHIVED: "Archived",
};

/** Customer-facing descriptions shown in the portal. */
export const STATE_DESCRIPTIONS: Record<CustomerState, string> = {
  LEAD: "We've received your request and are reviewing it.",
  PENDING_QUOTE:
    "We've sent you a preliminary quote (or a question) — check your email.",
  IN_DESIGN:
    "Quote accepted! We're producing a digital drawing of your piece — AutoCAD, plus a 3D SketchUp model when the design calls for it.",
  DESIGN_REVIEW:
    "Your design drawing is ready for your approval — check your email. Want changes? Just reply and we'll revise.",
  PENDING_DEPOSIT:
    "Design approved! We've sent the contract and a request for the 50% deposit to lock in your build slot.",
  DEPOSIT_RECEIVED: "Deposit received and contract signed — your project is queued.",
  IN_PRODUCTION: "Your piece is being built right now.",
  READY_FOR_DELIVERY:
    "Your piece is finished! We'll coordinate delivery or pickup and settle the remaining balance.",
  COMPLETED: "Project complete. Thank you!",
  DECLINED: "This request was closed.",
  ARCHIVED: "This request is inactive.",
};

/** Legal transitions. DECLINED/ARCHIVED are reachable from active states. */
const TRANSITIONS: Record<CustomerState, CustomerState[]> = {
  LEAD: ["PENDING_QUOTE", "DECLINED", "ARCHIVED"],
  PENDING_QUOTE: ["IN_DESIGN", "PENDING_QUOTE", "DECLINED", "ARCHIVED"],
  IN_DESIGN: ["DESIGN_REVIEW", "DECLINED", "ARCHIVED"],
  // revisions loop back to IN_DESIGN until the customer approves
  DESIGN_REVIEW: ["PENDING_DEPOSIT", "IN_DESIGN", "DECLINED", "ARCHIVED"],
  PENDING_DEPOSIT: ["DEPOSIT_RECEIVED", "DECLINED", "ARCHIVED"],
  DEPOSIT_RECEIVED: ["IN_PRODUCTION", "ARCHIVED"],
  IN_PRODUCTION: ["READY_FOR_DELIVERY"],
  READY_FOR_DELIVERY: ["COMPLETED"],
  COMPLETED: ["ARCHIVED"],
  DECLINED: ["LEAD", "ARCHIVED"], // a declined customer can come back
  ARCHIVED: ["LEAD"],
};

export function canTransition(from: CustomerState, to: CustomerState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function isCustomerState(v: string): v is CustomerState {
  return (CUSTOMER_STATES as readonly string[]).includes(v);
}

/** Order used to render progress timelines (happy path only). */
export const HAPPY_PATH: CustomerState[] = [
  "LEAD",
  "PENDING_QUOTE",
  "IN_DESIGN",
  "DESIGN_REVIEW",
  "PENDING_DEPOSIT",
  "DEPOSIT_RECEIVED",
  "IN_PRODUCTION",
  "READY_FOR_DELIVERY",
  "COMPLETED",
];

/**
 * Customer lifecycle state machine.
 *
 * A customer account moves through these states as their project progresses.
 * Use `canTransition` to enforce legal moves and `advanceState` helpers in
 * server code so future iterations (notifications, dashboards, automations)
 * can hang behavior off each state.
 */
export const CUSTOMER_STATES = [
  "LEAD", // form submitted — customer (potential)
  "PENDING_QUOTE", // we replied with a quote or asked for more info
  "PENDING_DEPOSIT", // customer accepted the quote, deposit not yet received
  "DEPOSIT_RECEIVED", // deposit in hand, project queued
  "IN_PRODUCTION", // actively being built
  "READY_FOR_DELIVERY", // build complete, awaiting pickup/delivery + final payment
  "COMPLETED", // delivered and paid in full
  "DECLINED", // customer declined the quote (or we declined the job)
  "ARCHIVED", // inactive/stale lead
] as const;

export type CustomerState = (typeof CUSTOMER_STATES)[number];

export const STATE_LABELS: Record<CustomerState, string> = {
  LEAD: "Customer (potential)",
  PENDING_QUOTE: "Customer (pending quote)",
  PENDING_DEPOSIT: "Customer (pending deposit)",
  DEPOSIT_RECEIVED: "Customer (deposit received)",
  IN_PRODUCTION: "In production",
  READY_FOR_DELIVERY: "Ready for delivery",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  ARCHIVED: "Archived",
};

/** Customer-facing descriptions shown in the portal. */
export const STATE_DESCRIPTIONS: Record<CustomerState, string> = {
  LEAD: "We've received your request and are reviewing it.",
  PENDING_QUOTE: "We've responded with a quote or a question — check your email.",
  PENDING_DEPOSIT: "Quote accepted! We're waiting on your deposit to get started.",
  DEPOSIT_RECEIVED: "Deposit received — your project is in the queue.",
  IN_PRODUCTION: "Your piece is being built right now.",
  READY_FOR_DELIVERY: "Your piece is finished and ready for delivery or pickup.",
  COMPLETED: "Project complete. Thank you!",
  DECLINED: "This request was closed.",
  ARCHIVED: "This request is inactive.",
};

/** Legal transitions. DECLINED/ARCHIVED are reachable from any active state. */
const TRANSITIONS: Record<CustomerState, CustomerState[]> = {
  LEAD: ["PENDING_QUOTE", "DECLINED", "ARCHIVED"],
  PENDING_QUOTE: ["PENDING_DEPOSIT", "PENDING_QUOTE", "DECLINED", "ARCHIVED"],
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
  "PENDING_DEPOSIT",
  "DEPOSIT_RECEIVED",
  "IN_PRODUCTION",
  "READY_FOR_DELIVERY",
  "COMPLETED",
];

"use client";

import { useSyncExternalStore } from "react";

/** A pin the visitor has collected for their quote request. */
export type SelectedPin = { id: string; title: string; img: string };

const KEY = "lsc-selected-pins";
const EVENT = "lsc-pins-changed";

function readRaw(): string {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(KEY) ?? "[]";
}

let cacheRaw = "";
let cacheParsed: SelectedPin[] = [];

function getSnapshot(): SelectedPin[] {
  const raw = readRaw();
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const parsed = JSON.parse(raw);
      cacheParsed = Array.isArray(parsed) ? parsed : [];
    } catch {
      cacheParsed = [];
    }
  }
  return cacheParsed;
}

function write(pins: SelectedPin[]) {
  window.localStorage.setItem(KEY, JSON.stringify(pins));
  window.dispatchEvent(new Event(EVENT));
}

export function togglePin(pin: SelectedPin): boolean {
  const pins = getSnapshot();
  const exists = pins.some((p) => p.id === pin.id);
  write(exists ? pins.filter((p) => p.id !== pin.id) : [...pins, pin]);
  return !exists;
}

export function removePin(id: string) {
  write(getSnapshot().filter((p) => p.id !== id));
}

export function clearPins() {
  write([]);
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // other tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const EMPTY: SelectedPin[] = [];

export function useSelectedPins(): SelectedPin[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

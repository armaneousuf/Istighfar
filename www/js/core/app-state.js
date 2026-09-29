import { persistStateSafely } from "./persist.js";

let state = null;
let isAnonymous = false;
let anonymousCount = 0;

export function getState() {
  return state;
}

export function setState(next) {
  state = next;
}

export function getIsAnonymous() {
  return isAnonymous;
}

export function setIsAnonymous(value) {
  isAnonymous = value;
}

export function getAnonymousCount() {
  return anonymousCount;
}

export function setAnonymousCount(value) {
  anonymousCount = value;
}

export function saveState() {
  if (!isAnonymous && state) {
    persistStateSafely(state);
  }
}

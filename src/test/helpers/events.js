import { expect, vi } from "vitest";

// Các service localStorage đều bắn một CustomEvent trên window sau mỗi lần ghi
// để useLessonsData cập nhật ngay. Helper này bắt sự kiện đó quanh một hành động.
export const captureEvent = (eventName, action) => {
  const listener = vi.fn();
  window.addEventListener(eventName, listener);

  try {
    action();
  } finally {
    window.removeEventListener(eventName, listener);
  }

  return listener;
};

export const expectEventFired = (eventName, action) => {
  const listener = captureEvent(eventName, action);
  expect(listener).toHaveBeenCalledTimes(1);
};

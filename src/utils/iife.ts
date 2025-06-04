/**
 * small utility to run a function immediately and return the result
 */
export const iife = <const T>(fn: () => T): T => fn();

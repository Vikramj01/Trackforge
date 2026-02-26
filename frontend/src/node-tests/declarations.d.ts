/**
 * Minimal type stubs for Node.js built-in modules used in node-tests.
 * These are needed because @types/node is not installed in this environment.
 */

declare module 'node:test' {
  export function describe(name: string, fn: () => void | Promise<void>): void
  export function it(name: string, fn: () => void | Promise<void>): void
  export function test(name: string, fn: () => void | Promise<void>): void
  export function beforeEach(fn: () => void | Promise<void>): void
  export function afterEach(fn: () => void | Promise<void>): void
}

interface StrictAssert {
  (value: unknown, message?: string): void
  equal(actual: unknown, expected: unknown, message?: string): void
  notEqual(actual: unknown, expected: unknown, message?: string): void
  ok(value: unknown, message?: string): void
  deepEqual(actual: unknown, expected: unknown, message?: string): void
  deepStrictEqual(actual: unknown, expected: unknown, message?: string): void
  strictEqual(actual: unknown, expected: unknown, message?: string): void
  throws(fn: () => void, message?: string): void
  doesNotThrow(fn: () => void, message?: string): void
}

declare module 'node:assert/strict' {
  const assert: StrictAssert
  export = assert
}

import { jest, describe, expect, test, it } from '@jest/globals';
import { isFunction, isPlainObject, isPromise, isGenerator } from '../src/helper';

test('if isFunction works properly', () => {
  expect(isFunction({})).toBe(false);
  expect(isFunction(() => {})).toBe(true);
});

test('if isFunction works properly', () => {
  expect(isFunction({})).toBe(false);
  expect(isFunction(() => {})).toBe(true);
});

test('if isPlainObject works properly', () => {
  expect(isPlainObject({})).toBe(true);
  expect(isPlainObject(12)).toBe(false);
  expect(isPlainObject(new Map())).toBe(false);
  expect(isPlainObject(false)).toBe(false);
});

test('if isPromise works properly', () => {
  expect(isPromise({})).toBe(false);
  expect(isPromise({ then() {}, catch() {} })).toBe(true);
  expect(isPromise(Promise.resolve())).toBe(true);
});

test('if isGenerator works properly', () => {
  function* A() {}
  async function* B() {}
  expect(isGenerator({})).toBe(false);
  expect(isGenerator({ next() {}, throw() {} })).toBe(true);
  expect(isGenerator(A())).toBe(true);
  expect(isGenerator(B())).toBe(true);
});

import { jest, describe, expect, test, it } from '@jest/globals';
import { TActionBase, transformActions, execGenerator, isFunction } from '../src/helper';
import { takeProps, takeState, sleep } from '../src/effects';

const SimpleObj = { loading: true };
const useActions = {
  num: 1,
  obj: {},
  A() {
    return 1;
  },
  B() {
    return {
      loading: true,
    };
  },
  C() {
    return Promise.resolve(SimpleObj);
  },
  D() {
    return Promise.resolve();
  },
  *E() {
    yield 1;
    yield SimpleObj;
    yield takeProps();
    yield takeState();
    yield Promise.resolve(SimpleObj);
  },
  async *F() {
    yield 1;
    yield SimpleObj;
    yield takeProps();
    yield takeState();
    yield Promise.resolve(SimpleObj);
  },
  *G() {
    while (true) {
      yield 1;
    }
  },
};

const getState = jest.fn();
const setState = jest.fn();
const getProps = jest.fn();

const actions = transformActions(
  // @ts-ignore
  useActions,
  setState,
  getState,
  getProps
);

beforeEach(() => {
  getState.mock.calls = [];
  setState.mock.calls = [];
  getProps.mock.calls = [];
});

test('transformActions works properly', () => {
  expect('num' in actions).toBeFalsy();
  expect('obj' in actions).toBeFalsy();
  expect(Object.values(actions).filter(isFunction).length).toBe(Object.keys(actions).length);
});

test('action that not return promise or generator', async () => {
  const { A, B } = actions;
  // function that return a none-object
  A();
  expect(getState).not.toBeCalled();
  expect(setState).toHaveBeenLastCalledWith(1);
  expect(getProps).not.toBeCalled();

  // function that return an object
  B();
  expect(getState).not.toBeCalled();
  expect(setState).toHaveBeenLastCalledWith(SimpleObj);
  expect(getProps).not.toBeCalled();
});

test('action that return resolved promise', async () => {
  const { C } = actions;
  C();
  await sleep(1);
  expect(getState).not.toBeCalled();
  expect(setState).toHaveBeenLastCalledWith(SimpleObj);
  expect(getProps).not.toBeCalled();
});

test('action that return resolved promise2', async () => {
  const { D } = actions;
  D();
  await sleep(1);
  expect(getState).not.toBeCalled();
  expect(setState).toHaveBeenLastCalledWith(undefined);
  expect(getProps).not.toBeCalled();
});

test('action that return a generator', async () => {
  const { E } = actions;
  E();
  await sleep(100);
  expect(getState).toBeCalled();
  expect(setState).toHaveBeenNthCalledWith(1, 1);
  expect(setState).toHaveBeenNthCalledWith(2, SimpleObj);
  expect(setState).toHaveBeenNthCalledWith(3, SimpleObj);
  expect(getProps).toBeCalled();
});

test('action that return a async generator', async () => {
  const { F } = actions;
  F();
  await sleep(100);
  expect(getState).toBeCalled();
  expect(setState).toHaveBeenNthCalledWith(1, 1);
  expect(setState).toHaveBeenNthCalledWith(2, SimpleObj);
  expect(setState).toHaveBeenNthCalledWith(3, SimpleObj);
  expect(getProps).toBeCalled();
});

// test('throw error', async () => {
//   const { G } = actions;
//   G();
// });

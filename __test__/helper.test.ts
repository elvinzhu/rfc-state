import { jest, describe, expect, test, it } from '@jest/globals';
import { TActionBase, transformActions, execGenerator, isFunction } from '../src/helper';
import { takeProps, takeState, putState, isAlive, sleep } from '../src/effects';

const SimpleObj = { loading: true };
const userActions = {
  num: 1,
  obj: {},
  B() {
    return { loading: true };
  },
  B2() {
    return putState({ loading: true });
  },
  C() {
    return Promise.resolve(SimpleObj);
  },
  C2() {
    return Promise.resolve(putState(SimpleObj));
  },
  *E() {
    yield 1;
    yield SimpleObj;
    yield takeProps();
    yield takeState();
    yield isAlive();
    yield Promise.resolve(SimpleObj);
  },
  *E2() {
    yield 1;
    yield putState(SimpleObj);
    yield takeProps();
    yield takeState();
    yield isAlive();
    yield Promise.resolve(putState(SimpleObj));
  },
  async *F() {
    yield 1;
    yield SimpleObj;
    yield takeProps();
    yield takeState();
    yield isAlive();
    yield Promise.resolve(SimpleObj);
  },
  async *F2() {
    yield 1;
    yield putState(SimpleObj);
    yield takeProps();
    yield takeState();
    yield isAlive();
    yield Promise.resolve(putState(SimpleObj));
  },
  *G() {
    while (true) {
      yield 1;
    }
  },
  *quickLoop() {
    while (true) {
      yield 1;
    }
  },
  *slowLoop() {
    let counter = 0;
    while (counter < 110) {
      yield sleep(20);
      counter += 1;
      yield 1;
    }
  },
};

const getState = jest.fn();
const setState = jest.fn();
const getProps = jest.fn();
const isAliveMock = jest.fn();

const getStateRef = () => {
  return {
    get state() {
      return getState();
    },
    get props() {
      return getProps();
    },
    get isAlive() {
      return isAliveMock();
    },
  };
};

const actions = transformActions(
  // @ts-ignore
  userActions,
  setState,
  getStateRef
);

beforeEach(() => {
  getState.mock.calls = [];
  setState.mock.calls = [];
  getProps.mock.calls = [];
  isAliveMock.mock.calls = [];
});

test('transformActions works properly', () => {
  expect('num' in actions).toBeFalsy();
  expect('obj' in actions).toBeFalsy();
  expect(Object.values(actions).filter(isFunction).length).toBe(Object.keys(actions).length);
});

test('action that not return promise or generator', async () => {
  const { B, B2 } = actions;
  // function that return an object without pusState
  B();
  expect(setState).not.toBeCalled();
  // function that return an object with pusState
  B2();
  expect(setState).toHaveBeenLastCalledWith(SimpleObj);
});

test('action that return resolved promise', async () => {
  const { C, C2 } = actions;
  C();
  await sleep(1);
  expect(setState).not.toBeCalled();

  C2();
  await sleep(1);
  expect(setState).toHaveBeenLastCalledWith(SimpleObj);
});

test('action that return a generator without using effects', async () => {
  const { E } = actions;
  E();
  await sleep(100);
  expect(getState).toBeCalled();
  expect(setState).not.toBeCalled();
  expect(getProps).toBeCalled();
  expect(isAliveMock).toBeCalled();
});

test('action that return a generator', async () => {
  const { E2 } = actions;
  E2();
  await sleep(100);
  expect(getState).toBeCalled();
  expect(getProps).toBeCalled();
  expect(isAliveMock).toBeCalled();
  expect(setState).toHaveBeenNthCalledWith(1, SimpleObj);
  expect(setState).toHaveBeenNthCalledWith(2, SimpleObj);
});

test('action that return a async generator without using effects', async () => {
  const { F } = actions;
  F();
  await sleep(1);
  expect(getState).toBeCalled();
  expect(getProps).toBeCalled();
  expect(setState).not.toBeCalled();
});

test('action that return a async generator', async () => {
  const { F2 } = actions;

  F2();
  await sleep(1);
  expect(getState).toBeCalled();
  expect(getProps).toBeCalled();
  expect(setState).toHaveBeenNthCalledWith(1, SimpleObj);
  expect(setState).toHaveBeenNthCalledWith(2, SimpleObj);
});

test('throw error', async () => {
  const { quickLoop, slowLoop } = actions;
  try {
    await quickLoop();
  } catch (err) {
    expect(/infinite loop/.test(err.message)).toBe(true);
  }

  try {
    await slowLoop();
    expect(1).toBe(1);
  } catch (err) {}
});

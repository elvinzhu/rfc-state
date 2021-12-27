import { useState, useMemo, useRef } from 'react';

type TStateBase = Record<string, any>;
type TActionBase = Record<string, (...args: any[]) => TStateBase | Promise<TStateBase> | void>;
// type ExtractRestParameter<T extends (...args: any) => any> = T extends (arg: any, ...rest: infer P) => any ? P : never;
// type ExtractKeysOfValueType<T, K> = { [I in keyof T]: T[I] extends K ? I : never }[keyof T];

const TYPE_KEY = Symbol('TYPE');
const TYPE_TAKE_STATE = 'TAKE_STATE';

export function takeState<T>(): T {
  return { [TYPE_KEY]: TYPE_TAKE_STATE } as any;
}

export default function rfcState<TValue extends TStateBase, TAction extends TActionBase>(initialValue: TValue, rawActions?: TAction) {
  const [data, setData] = useState<TValue>(initialValue);
  const stateRef = useRef(data);
  stateRef.current = data;

  const exports = useMemo(() => {
    const getState = () => stateRef.current;
    const setState = (newState: TValue) => {
      if (newState && isPlainObject(newState)) {
        setData({ ...stateRef.current, ...newState });
      }
    };
    return {
      getState,
      setState,
      actions: transformActions(rawActions, setState, getState),
    };
  }, []);

  return { state: data, ...exports };
}

function isPlainObject(target: any) {
  return Object.prototype.toString.call(target) === '[object Object]';
}

function isPromise(obj: any) {
  return obj instanceof Promise || (Boolean(obj) && typeof obj.then === 'function');
}

function isGenerator(obj: any) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

function isGeneratorFunction(obj: any) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

function transformActions(rawActions: TActionBase, setState: (newState: TStateBase) => void, getState: () => TStateBase) {
  const actions = {} as TActionBase;
  if (rawActions && isPlainObject(rawActions)) {
    for (let key in rawActions) {
      if (typeof rawActions[key] === 'function') {
        const fn = rawActions[key];
        actions[key] = function () {
          const res = fn.apply(null, arguments);
          if (isGeneratorFunction(fn)) {
            execGenerator(res as any, setState, getState);
          } else if (isPromise(res)) {
            (res as Promise<any>).then(setState);
          } else {
            setState(res as TStateBase);
          }
          return res;
        };
      }
    }
  }
  return actions;
}

function execGenerator(iterator: { next: Function }, setState: Function, getState: Function) {
  let counter = 0;
  let beginTime = Date.now();
  (function execNext(result?: any) {
    counter++;
    if (Date.now() > beginTime + 1000) {
      if (counter > 100) {
        // executed 100 times in just one second!
        // there must be something wrong!
        throw new Error('It looks like there is a infinite loop in your generator function?');
      } else {
        beginTime = Date.now();
        counter = 0;
      }
    }
    const gRes = iterator.next(result);
    const setAndNext = (iRes: { done: boolean; value: any }, state = iRes.value) => {
      let nextParam = state;
      if (state) {
        if (state[TYPE_KEY] === TYPE_TAKE_STATE) {
          nextParam = getState();
        } else {
          setState(state);
        }
      }
      if (!iRes.done) {
        execNext(nextParam);
      }
    };
    if (isPromise(gRes)) {
      // async generator
      (gRes as Promise<any>).then(setAndNext);
    } else if (isPromise(gRes.value)) {
      // sync generator that yield a Promise
      gRes.value.then((res: TStateBase) => {
        setAndNext(gRes, res);
      });
    } else {
      // sync generator that yield a none-Promise value
      setAndNext(gRes);
    }
  })();
}

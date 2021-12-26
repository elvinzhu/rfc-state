import { useState, useMemo, useRef, useCallback } from 'react';

type TStateBase = Record<string, any>;
type TActionBase = Record<string, (...args: any[]) => TStateBase | Promise<TStateBase> | void>;
type ExtractRestParameter<T extends (...args: any) => any> = T extends (arg: any, ...rest: infer P) => any ? P : never;
// type ExtractKeysOfValueType<T, K> = { [I in keyof T]: T[I] extends K ? I : never }[keyof T];

export default function rfcState<TValue extends TStateBase, TAction extends TActionBase>(initialValue: TValue, rawActions?: TAction) {
  const [data, setData] = useState<TValue>(initialValue);
  const stateRef = useRef(data);
  stateRef.current = data;

  const getState = useCallback(() => stateRef.current, []);
  const setState = useCallback((newState: TValue) => {
    if (newState && isPlainObject(newState)) {
      setData({ ...stateRef.current, ...newState });
    }
  }, []);

  type TMemoizedActions = {
    [Key in keyof TAction]: (...args: ExtractRestParameter<TAction[Key]>) => ReturnType<TAction[Key]>;
  };

  const actions = useMemo<TMemoizedActions>(() => {
    if (rawActions && isPlainObject(rawActions)) {
      const memoizedActions = {} as TMemoizedActions;
      for (let key in rawActions) {
        if (typeof rawActions[key] === 'function') {
          const fn = rawActions[key];
          memoizedActions[key] = function (...args: any[]) {
            const res = fn(stateRef.current, ...args);
            if (res instanceof Promise) {
              res.then(setState);
            } else if (isGeneratorFunction(fn)) {
              // is generator
              execGenerator(res as any, setState);
            } else {
              setState(res as TValue);
            }
            return res;
          } as any;
        }
      }
      return memoizedActions;
    }
  }, []);

  return { state: data, actions, getState, setState };
}

function isPlainObject(target: any) {
  return Object.prototype.toString.call(target) === '[object Object]';
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

function execGenerator(iterator: { next: Function }, setState: Function) {
  let counter = 0;
  let beginTime = Date.now();
  (function execNext(result?: any) {
    counter++;
    if (Date.now() > beginTime + 1000) {
      if (counter > 100) {
        // executed 100 times in just one second!
        // there must be something wrong!
        throw new Error('infinite loop in your generator function?');
      } else {
        beginTime = Date.now();
        counter = 0;
      }
    }
    const gRes = iterator.next(result);
    if (gRes instanceof Promise) {
      // async generator
      gRes.then((gRes2) => {
        setState(gRes2.value);
        if (!gRes2.done) {
          execNext(gRes2.value);
        }
      });
    } else {
      // sync generator
      setState(gRes.value);
      if (!gRes.done) {
        execNext(gRes.value);
      }
    }
  })();
}

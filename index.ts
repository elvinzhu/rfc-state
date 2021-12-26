import { useState, useMemo, useRef, useCallback } from 'react';

type TStateBase = Record<string, any>;
type TActionBase = Record<string, (...args: any[]) => TStateBase | Promise<TStateBase> | void>;
type ExtractRestParameter<T extends (...args: any) => any> = T extends (arg: any, ...rest: infer P) => any ? P : never;
// type ExtractKeysOfValueType<T, K> = { [I in keyof T]: T[I] extends K ? I : never }[keyof T];

function isPlainObject(target: any) {
  return Object.prototype.toString.call(target) === '[object Object]';
}

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

import { useState, useMemo, useRef, useCallback } from 'react';

type TStateBase = Record<string, any>;
type TActionBase = Record<string, (...args: any[]) => TStateBase | Promise<TStateBase> | void>;
type ExtractRestParameter<T extends (...args: any) => any> = T extends (arg: any, ...rest: infer P) => any ? P : never;

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

  type ImmutableActions = {
    [Key in keyof TAction]: (...args: ExtractRestParameter<TAction[Key]>) => ReturnType<TAction[Key]>;
  };

  const actions = useMemo<ImmutableActions>(() => {
    if (rawActions && isPlainObject(rawActions)) {
      const immutableActions = {} as ImmutableActions;
      for (let key in rawActions) {
        if (typeof rawActions[key] === 'function') {
          const fn = rawActions[key];
          immutableActions[key] = function (...args: any[]) {
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
      return immutableActions;
    }
  }, []);

  return { state: data, actions, getState, setState };
}

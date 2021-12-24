import { useState, useMemo, useRef, useCallback } from 'react';

type TStateBase = Record<string, any>;
type TActionBase = Record<string, (...args: any[]) => TStateBase | Promise<TStateBase> | void>;
type ExtractRestParameter<T extends (...args: any) => any> = T extends (arg: any, ...rest: infer P) => any ? P : never;

export default function rfcState<TValue extends TStateBase, TAction extends TActionBase>(initialValue: TValue, rawActions?: TAction) {
  const [data, setData] = useState<TValue>(initialValue);
  const stateRef = useRef(data);
  stateRef.current = data;

  const getState = useCallback(() => stateRef.current, []);
  const setState = useCallback((newState: TValue) => {
    setData({ ...stateRef.current, ...newState });
  }, []);

  type TransformedActions = {
    [Key in keyof TAction]: (...args: ExtractRestParameter<TAction[Key]>) => ReturnType<TAction[Key]>;
  };

  const actions = useMemo<TransformedActions>(() => {
    const transformedActions = {} as TransformedActions;
    if (rawActions) {
      const trySetState = (newState: any) => {
        if (newState && Object.prototype.toString.call(newState) === '[object Object]') {
          setState(newState);
        }
      };
      for (let key in rawActions) {
        if (rawActions.hasOwnProperty(key) && typeof rawActions[key] === 'function') {
          const fn = rawActions[key];
          transformedActions[key] = function (...args: any[]) {
            const res = fn(stateRef.current, ...args);
            if (res instanceof Promise) {
              res.then(trySetState);
            } else {
              trySetState(res);
            }
            return res;
          };
        }
      }
    }
    return transformedActions;
  }, []);

  return { state: data, getState, setState, actions };
}

// const _actions = {
//   getData(id: string) {
//     return [1, 2, 3];
//   },
// };

// function App() {
//   const { state, actions } = rfcState({ id: 0 }, _actions);

//   actions.getData("1");

//   state.id
// }

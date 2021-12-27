import { useState, useMemo, useRef } from 'react';
import { isGeneratorFn, isPlainObject, isPromise } from './helper';
import { TYPE_KEY, TYPE_TAKE_PROPS, TYPE_TAKE_STATE } from './consts';

type TAnyObject = Record<string, any>;
type TActionBase = Record<string, (...args: any[]) => TAnyObject | Promise<TAnyObject> | void>;

/**
 * similar to React.useState but much more powerful;
 * @param initialState initial state.
 * @param rawActions action callbacks.
 * @param props component's props.
 * @returns
 */
export default function rfcState<TState extends TAnyObject, TAction extends TActionBase, TProps extends TAnyObject>(initialState: TState, rawActions?: TAction, props?: TProps) {
  const [data, setData] = useState<TState>(initialState);
  const stateRef = useRef<{ state: TState; props: TProps }>({ state: data, props });
  stateRef.current.state = data;
  stateRef.current.props = props;

  const returns = useMemo(() => {
    const getState = () => stateRef.current.state;
    const getProps = () => stateRef.current.props;
    const setState = (newState: TState) => {
      if (newState && isPlainObject(newState)) {
        setData({ ...stateRef.current, ...newState });
      }
    };
    return {
      getState,
      setState,
      // TODO: make all actions return void?
      actions: transformActions(rawActions, setState, getState, getProps) as TAction,
    };
  }, []);

  return { state: data, ...returns };
}

export * from './effects';

function transformActions(rawActions: TActionBase, setState: Function, getState: Function, getProps: Function) {
  const actions = {} as TActionBase;
  if (rawActions && isPlainObject(rawActions)) {
    for (let key in rawActions) {
      if (typeof rawActions[key] === 'function') {
        const fn = rawActions[key];
        actions[key] = function () {
          const res = fn.apply(null, arguments);
          if (isGeneratorFn(fn)) {
            execGenerator(res, setState, getState, getProps);
          } else if (isPromise(res)) {
            res.then(setState);
          } else {
            setState(res);
          }
        };
      }
    }
  }
  return actions;
}

function execGenerator(iterator: { next: Function }, setState: Function, getState: Function, getProps: Function) {
  let counter = 0;
  let beginTime = Date.now();
  (function execNext(result?: any) {
    counter++;
    if (Date.now() > beginTime + 1000) {
      if (counter > 100) {
        // executed 100 times in just one second!
        // there must be something wrong!
        throw new Error('It looks like there is a infinite loop in your generator function!');
      } else {
        beginTime = Date.now();
        counter = 0;
      }
    }
    const gRes = iterator.next(result);
    const setAndNext = (iRes: { done: boolean; value: any }, state = iRes.value) => {
      let param = state;
      if (state) {
        if (state[TYPE_KEY] === TYPE_TAKE_STATE) {
          param = getState();
        } else if (state[TYPE_KEY] === TYPE_TAKE_PROPS) {
          param = getProps();
        } else {
          setState(state);
        }
      }
      if (!iRes.done) {
        execNext(param);
      }
    };
    if (isPromise(gRes)) {
      // async generator
      (gRes as Promise<any>).then(setAndNext);
    } else if (isPromise(gRes.value)) {
      // sync generator that yield a Promise
      gRes.value.then((res: TAnyObject) => {
        setAndNext(gRes, res);
      });
    } else {
      // sync generator that yield a none-Promise value
      setAndNext(gRes);
    }
  })();
}

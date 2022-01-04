import { useState, useMemo, useRef } from 'react';
import { TAnyObject, TActionBase, transformActions, isPlainObject, isFunction } from './helper';

/**
 * similar to React.useState but much more powerful;
 * @param initialState initial state.
 * @param rawActions action callbacks.
 * @param props component's props.
 * @returns
 */
export default function rfcState<TState extends TAnyObject, TAction extends TActionBase, TProps extends TAnyObject>(initialState: TState | (() => TState), rawActions?: TAction, props?: TProps) {
  const [data, setData] = useState<TState>(initialState);
  const stateRef = useRef<{ state: TState; props: TProps }>({ state: data, props });
  stateRef.current.state = data;
  stateRef.current.props = props;

  // type MemorizedAction = {
  //   [Key in keyof TAction]: (...args: Parameters<TAction[Key]>) => void;
  // };

  const returns = useMemo(() => {
    const getState = () => stateRef.current.state;
    const getProps = () => stateRef.current.props;
    const setState = (newState: TState | ((oldState: TState) => TState)) => {
      if (isFunction(newState)) {
        setData(newState);
      } else if (newState && isPlainObject(newState)) {
        setData({ ...stateRef.current.state, ...newState });
      }
    };
    return {
      getState,
      setState,
      // TODO: make all actions return void?
      actions: transformActions(rawActions, setState, getState, getProps),
    };
  }, []);

  return { state: data, ...returns };
}

/**
 * build the return type of generator;
 */
export type GeneratorReturn<T, TReturn = any, TNext = any> =
  | AsyncGenerator<Partial<T> | Promise<Partial<T> | void>, TReturn, TNext>
  | Generator<Partial<T> | Promise<Partial<T> | void>, TReturn, TNext>;

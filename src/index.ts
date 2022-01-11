import { useState, useMemo, useRef } from 'react';
import { TAnyObject, TActionBase, transformActions, isPlainObject, isFunction } from './helper';

/**
 * Similar to React.useState but much more powerful;
 * @param initialState initial state. The same to React.useState.
 * @param rawActions callbacks. The return type of Generator functions will be changed to Promise<void> to indicate if the generator is done.
 * @param props component's props.
 * @returns {*} different form React.useState, \`useRfcState\` returns an object.
 * @see {@link https://github.com/elvinzhu/rfc-state}
 * @example
 * import useRfcState from 'rfc-state';
 * import * as rawActions from './actions';
 *
 * function MyComponent(props: IProps) {
 *    const { state, actions, getState } = useRfcState({ count: 0 }, rawActions, props);
 *    // other code here;
 * }
 */
export default function useRfcState<TState extends TAnyObject, TAction extends TActionBase, TProps extends TAnyObject>(initialState: TState | (() => TState), rawActions?: TAction, props?: TProps) {
  const [data, setData] = useState<TState>(initialState);
  const stateRef = useRef<{ state: TState; props: TProps }>({ state: data, props });
  stateRef.current.state = data;
  stateRef.current.props = props;

  type MemorizedAction = {
    [Key in keyof TAction]: (...args: Parameters<TAction[Key]>) => ReturnType<TAction[Key]> extends Generator | AsyncGenerator ? Promise<void> : ReturnType<TAction[Key]>;
  };

  const returns = useMemo(() => {
    const getState = () => stateRef.current.state;
    const getProps = () => stateRef.current.props;
    const setState = (newState: TState | ((oldState: TState) => TState)) => {
      if (newState) {
        if (isFunction(newState)) {
          newState = newState(getState());
        }
        if (isPlainObject(newState)) {
          setData({ ...stateRef.current.state, ...newState });
        }
      }
    };
    return {
      getState,
      setState,
      actions: transformActions<MemorizedAction>(rawActions, setState, getState, getProps),
    };
  }, []);

  return { state: data, ...returns };
}

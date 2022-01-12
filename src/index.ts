import { useState, useMemo, useRef, useEffect } from 'react';
import { TAnyObject, TActionBase, transformActions, isFunction } from './helper';

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
  const [state, setInnerState] = useState<TState>(initialState);
  const stateRef = useRef<{ state: TState; props: TProps; isAlive: boolean }>({ state, props, isAlive: true });
  stateRef.current.state = state;
  stateRef.current.props = props;

  const returns = useMemo(() => {
    const getStateRef = () => stateRef.current;
    const getState = () => stateRef.current.state;
    const setState = (newState: Partial<TState> | ((oldState: TState) => Partial<TState>)) => {
      if (isFunction(newState)) newState = newState(getState());
      setInnerState({ ...getState(), ...newState });
    };
    const actions = transformActions(rawActions, setState, getStateRef);
    return { getState, setState, actions };
  }, []);

  useEffect(() => {
    return () => {
      stateRef.current.isAlive = false;
    };
  }, []);

  return { state, ...returns };
}

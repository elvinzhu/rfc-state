import { TYPE_KEY, TYPE_TAKE_STATE, TYPE_TAKE_PROPS } from './consts';

/**
 * get the state;
 * @returns the component's rfc-state
 */
export function takeState<T>(): T {
  return { [TYPE_KEY]: TYPE_TAKE_STATE } as any;
}

/**
 * get the props;
 * @returns the component's props
 */
export function takeProps<T>(): T {
  return { [TYPE_KEY]: TYPE_TAKE_PROPS } as any;
}

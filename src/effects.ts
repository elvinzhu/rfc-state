import { TYPE_KEY, TYPE_TAKE_STATE, TYPE_TAKE_PROPS, TYPE_PUT_STATE, TYPE_IS_ALIVE } from './consts';

/**
 * set state;
 * @returns
 */
export function putState<S extends Record<string, any> = Record<string, any>>(state: S) {
  return {
    ...state,
    [TYPE_KEY]: TYPE_PUT_STATE,
  } as S;
}

/**
 * get the original state;
 * @returns the component's original rfc-state
 */
export function takeState() {
  return { [TYPE_KEY]: TYPE_TAKE_STATE } as Record<string, any>;
}

/**
 * get the original props;
 * @returns the component's original props
 */
export function takeProps() {
  return { [TYPE_KEY]: TYPE_TAKE_PROPS } as Record<string, any>;
}

/**
 * check if the component is alive or not.
 * @returns Boolean
 */
export function isAlive() {
  return { [TYPE_KEY]: TYPE_IS_ALIVE } as any as boolean;
}

/**
 * sleep 'time' millisecond
 * @param time
 * @returns
 */
export function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

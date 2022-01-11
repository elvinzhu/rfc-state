import { TYPE_KEY, TYPE_TAKE_STATE, TYPE_TAKE_PROPS, TYPE_PUT_STATE } from './consts';

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
 * get the state;
 * @returns the component's rfc-state
 */
export function takeState() {
  return { [TYPE_KEY]: TYPE_TAKE_STATE } as Record<string, any>;
}

/**
 * get the props;
 * @returns the component's props
 */
export function takeProps() {
  return { [TYPE_KEY]: TYPE_TAKE_PROPS } as Record<string, any>;
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

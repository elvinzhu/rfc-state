import { TYPE_KEY, TYPE_TAKE_STATE, TYPE_TAKE_PROPS } from './consts';

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

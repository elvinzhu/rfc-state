export const hasSymbol = typeof Symbol === 'function';
export const TYPE_KEY = hasSymbol ? Symbol('TYPE') : '__RFC_STATE_TYPE_KEY_DO_NOT_USE__';
export const TYPE_TAKE_STATE = 'TAKE_STATE';
export const TYPE_TAKE_PROPS = 'TAKE_PROPS';

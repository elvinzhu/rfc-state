export const hasSymbol = typeof Symbol === 'function';
export const TYPE_KEY = hasSymbol ? Symbol('TYPE') : '__rfc_state_type';
export const TYPE_TAKE_STATE = 'TAKE_STATE';
export const TYPE_TAKE_PROPS = 'TAKE_PROPS';

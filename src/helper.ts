// export type ExtractRestParameter<T extends (...args: any) => any> = T extends (arg: any, ...rest: infer P) => any ? P : never;
// export type ExtractKeysOfValueType<T, K> = { [I in keyof T]: T[I] extends K ? I : never }[keyof T];

export function isPlainObject(target: any) {
  return Object.prototype.toString.call(target) === '[object Object]';
}

export function isPromise(obj: any) {
  return obj instanceof Promise || (Boolean(obj) && typeof obj.then === 'function');
}

export function isGenerator(obj: any) {
  return Boolean(obj) && 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

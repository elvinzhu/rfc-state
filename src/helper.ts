// export type ExtractRestParameter<T extends (...args: any) => any> = T extends (arg: any, ...rest: infer P) => any ? P : never;
// export type ExtractKeysOfValueType<T, K> = { [I in keyof T]: T[I] extends K ? I : never }[keyof T];

export function isPlainObject(target: any) {
  return Object.prototype.toString.call(target) === '[object Object]';
}

export function isPromise(target: any): target is Promise<any> {
  return Boolean(target) && typeof target.then === 'function' && typeof target.catch === 'function';
}

export function isFunction(target: any): target is Function {
  return typeof target === 'function';
}

export function isGenerator(target: any): target is Generator | AsyncGenerator {
  return Boolean(target) && typeof target.next === 'function' && typeof target.throw === 'function';
}

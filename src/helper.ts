// export type ExtractRestParameter<T extends (...args: any) => any> = T extends (arg: any, ...rest: infer P) => any ? P : never;
// export type ExtractKeysOfValueType<T, K> = { [I in keyof T]: T[I] extends K ? I : never }[keyof T];
import { TYPE_KEY, TYPE_TAKE_PROPS, TYPE_TAKE_STATE } from './consts';

export type TAnyObject = Record<string, any>;
export type TActionBase = Record<string, (...args: any[]) => any>;

/**
 * transform user's actions to rfc-state's controled actions;
 */
export function transformActions<T extends TActionBase>(rawActions: T, setState: (obj: any) => void, getState: Function, getProps: Function) {
  const actions = {} as T;
  if (rawActions && (isPlainObject(rawActions) || isModule(rawActions))) {
    for (let key in rawActions) {
      if (typeof rawActions[key] === 'function') {
        const fn = rawActions[key];
        actions[key] = function () {
          const res = fn.apply(null, arguments);
          if (isGenerator(res)) {
            execGenerator(res, setState, getState, getProps);
          } else if (isPromise(res)) {
            res.then(setState);
          } else {
            setState(res);
          }
          return res;
        } as T[Extract<keyof T, string>];
      }
    }
  }
  return actions;
}

/**
 * execute the generator function
 */
export function execGenerator(iterator: { next: Function }, setState: Function, getState: Function, getProps: Function) {
  let counter = 0;
  let beginTime = Date.now();
  (function execNext(result?: any) {
    counter += 1;
    if (counter > 100) {
      if (Date.now() < beginTime + 1000) {
        // executed 100 times in just one second!
        // there must be something wrong!
        throw new Error("It looks like there's a infinite loop that executed too quickly in your generator function!");
      } else {
        beginTime = Date.now();
        counter = 0;
      }
    }
    const gRes = iterator.next(result);
    const setAndNext = (iRes: { done: boolean; value: any }, state = iRes.value) => {
      let param = state;
      if (state) {
        if (state[TYPE_KEY] === TYPE_TAKE_STATE) {
          param = getState();
        } else if (state[TYPE_KEY] === TYPE_TAKE_PROPS) {
          param = getProps();
        } else {
          setState(state);
        }
      }
      if (!iRes.done) {
        execNext(param);
      }
    };
    if (isPromise(gRes)) {
      // async generator
      gRes.then(setAndNext);
    } else if (isPromise(gRes.value)) {
      // sync generator that yield a Promise
      gRes.value.then((res: TAnyObject) => {
        setAndNext(gRes, res);
      });
    } else {
      // sync generator that yield a none-Promise value
      setAndNext(gRes);
    }
  })();
}

export function isPlainObject(target: any) {
  const type = Object.prototype.toString.call(target);
  return type === '[object Object]';
}

export function isModule(target: any) {
  const type = Object.prototype.toString.call(target);
  return type === '[object Module]';
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

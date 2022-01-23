# rfc-state (react function component state)

A clean way to manage the state and callbacks of your react function component!

## Installation

```
npm install rfc-state --save
```

## Features

- Tear off the callbacks from the function component.
- Centralized state.
- Memorized callbacks(for better performance).
- Fully typescript-ready.
- No dependencies except `tslib`

## Example

A quick example

```ts
// ./actions.ts
import { takeProps, takeState, putState } from 'rfc-state/effects';
export function changeTitle() {
  return putState({ title: 'rfc-state is awesome!' });
}
// ./index.tsx
import useRfcState from 'rfc-state';
import * as rawActions from './actions';
function MyComponent(props) {
  const { state, actions } = useRfcState({ title: 'using rfc-state' }, rawActions, props);
  return (
    <div>
      <h2>{state.title}</h2>
      <button onClick={actions.changeTitle}>Change Title</button>
    </div>
  );
}
```

## API

### useRfcState

```js
const { state, actions, setState, getState } = useRfcState(initialState, rawActions, props);
```

arguments:

- `initialState` object or function. just like `React.useState`
- `rawActions` the callbacks that will be used in your function component
- `props` the props

returns:

> Note it's an object instead of an array!

- `state` the state
- `actions` turned from passed `rawActions`. each action now has the capacity to change the state.
  > The return type of Generator functions will be changed to Promise<void> to indicate if the generator is done.
- `setState` `getState` works just as they literally tells, and stay unchanged so it's safe to nest them in your callbacks.

### effects

```js
import { takeProps, takeState, putState, isAlive } from 'rfc-state/effects';
```

by leveraging those `effects`, your actions will be able to read the current `state` and `props` of your function component, and also change the `state`.

- `takeProps` read the current `props`
- `takeState` read the current `state`
- `putState` set state
- `isAlive` to check if the function component is alive or not

## Define actions

`actions` the key and magic parts of `rfc-state`. let's lean about how to define all kinds of your actions.
  
 NOTE:
  - The async function will be turned into sync function that return a promise.
  - The return type of Generator functions will be changed to Promise to indicate if the generator is done.

### a simple action

```ts
export function changeTitle() {
  return putState({ title: 'rfc-state is awesome!' });
}
```
  
### return a promise

`rfc-state` will wait until the promise to be resolved, and change the state.

```ts
export function getData() {
  return fetch('/getData')
    .then(res => res.json())
    .then(data => {
      return pustState({ data });
    });
}
```

### async function

```ts
export async function getData() {
  const data = await fetch('/getData').then(res => res.json());
  return pustState({ data });
}
```

### reading `props` and `state`

now we need to utilize the Generation Function.

```ts
export function* getData() {
  const props: IProps = yield takeProps();
  const props: IState = yield takeState();

  yield putState({ loading: true });
  const data = yield fetch('/getData?id=' + props.id).then(res => res.json());
  yield pustState({ data });

  // or
  // yield fetch('/getData?id=' + props.id)
  //   .then(res => res.json())
  //   .then(res => {
  //     return pustState({ data });
  //   });

  yield putState({ loading: false });
}
```

### async generator

```ts
export async function* getData() {
  const props: IProps = yield takeProps();
  const data = await fetch('/getData?id=' + props.id).then(res => res.json());
  yield pustState({ data });
}
```

# License

MIT

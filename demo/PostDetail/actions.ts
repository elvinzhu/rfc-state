// import { takeProps, takeState } from 'rfc-state/effects';
import { takeProps, takeState, putState } from '../../src/effects';
import { IProps, IState, IPost } from './types';

function mockRequest<T>(res: T): Promise<{ success: boolean; data: T }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, data: res });
    }, 10);
  });
}

export function* getDetail(): Generator<any, any, any> {
  const state: IState = yield takeState();
  const props: IProps = yield takeProps();

  console.log(state, props);

  yield putState({ loading: true });
  const res = yield mockRequest<IPost>({
    id: props.id,
    title: 'test-title-' + props.id,
  }) as Promise<any>;
  if (res.success) {
    yield putState({
      postDetail: res.data,
      loading: false,
    });
  } else {
    yield putState({
      detailError: 'error',
      loading: false,
    });
  }
}

export function changeTitle() {
  return putState({
    title: 'I love rfc-state！',
  });
}

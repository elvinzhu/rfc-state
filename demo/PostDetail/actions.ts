// import { takeProps, takeState } from 'rfc-state/effects';
import { takeProps, takeState } from '../../src/effects';
import { IProps, IState, IPost } from './types';

function mockRequest<T>(res: T): Promise<{ success: boolean; data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: res });
    }, 300);
  });
}

export async function* getDetail(id: number): AsyncGenerator<Partial<IState>, any, any> {
  const state: IState = yield takeState();
  const props: IProps = yield takeProps();

  console.log(state, props);

  yield { loading: true };
  const res = await mockRequest<IPost>({
    id: props.id,
    title: 'test-title-' + props.id,
  });
  if (res.success) {
    yield {
      postDetail: res.data,
      loading: false,
    };
  } else {
    yield {
      detailError: 'error',
      loading: false,
    };
  }
}

export function updatePost({ id, title }: IPost) {
  return mockRequest(null).then((res) => {
    if (res.success) {
      return res.data;
    }
  });
}

export function changeTitle() {
  return {
    title: 'I love rfc-state！',
  };
}

export interface IPost {
  id: number;
  title: string;
}

export interface IState {
  id: number;
  detailLoading?: boolean;
  postDetail?: IPost;
  detailError?: string;
}

function mockRequest<T>(res: T): Promise<{ success: boolean; data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: res });
    }, 300);
  });
}

export async function* getDetail({ id }, test: string): AsyncGenerator<Partial<IState>> {
  yield { detailLoading: true };
  const res = await mockRequest<IPost>({
    id: 1,
    title: 'rfc-state is awesome!',
  });
  if (res.success) {
    yield {
      postDetail: res.data,
      detailLoading: false,
    };
  } else {
    yield {
      detailError: 'error to fetch data!',
      detailLoading: false,
    };
  }
}

export async function updatePost({ id, title }: IPost) {
  return mockRequest(null).then((res) => {
    if (res.success) {
    }
  });
}

export function changeTitle() {
  return {
    title: 'I love rfc-state！',
  };
}

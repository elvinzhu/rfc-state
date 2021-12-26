function mockRequest<T>(res: T): Promise<{ success: boolean; data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: res });
    }, 300);
  });
}

export interface IPost {
  id: number;
  title: string;
}

export interface IState {
  id: number;
  postDetail?: IPost;
  detailError?: string;
}

export function getDetail({ id }, test: string): Promise<Partial<IState>> {
  return mockRequest<IPost>({
    id: 1,
    title: 'rfc-state is awesome!',
  })
    .then((res) => {
      if (res.success) {
        return {
          postDetail: res.data,
        };
      } else {
        // return {
        //   detailError: 'error to get post detial',
        // };
        // message.error(res.errMsg)
      }
    })
    .catch((err: any) => {
      return {
        detailError: 'error to get post detial',
      };
    });
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

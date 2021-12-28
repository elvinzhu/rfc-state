export interface IPost {
  id: number;
  title: string;
}

export interface IState {
  id: number;
  loading?: boolean;
  postDetail?: IPost;
  detailError?: string;
}

export interface IProps {
  id: number;
}

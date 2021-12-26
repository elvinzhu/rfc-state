import { useCallback } from 'react';
import useState from '../../index';
import { IState, getDetail, updatePost } from './helper';

const intialValues: IState = {
  id: null,
};

const rawActions = {
  getDetail,
  updatePost,
};

interface IProps {
  id: number;
}

export default function PostDetail({ id }: IProps) {
  const { state, actions } = useState(intialValues, rawActions);
  const { getDetail, updatePost } = actions;

  useCallback(() => {
    getDetail('xxx');
  }, []);

  return (
    <div>
      <p>
        post id: <span>{state.id}</span>
      </p>
      <p>
        post title: <span>{state.postDetail}</span>
      </p>
      <button onClick={updatePost}>更新</button>
    </div>
  );
}

import { useCallback } from 'react';
import useState from '../index';
import * as handlers from './actions';

export function PostDetail({ id }: { id: number }) {
  const { state, actions } = useState({ id, title: '' }, handlers);
  const { getDetail, deletePost } = actions;

  useCallback(() => {
    getDetail('xxx');
  }, []);

  return (
    <div>
      <p>post id: {state.id}</p>
      <p>post title: {state.title}</p>
      <button onClick={deletePost}>删除</button>
    </div>
  );
}

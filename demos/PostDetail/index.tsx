import { useCallback } from 'react';
import useState from '../../src';
import * as rawActions from './actions';
import { IProps, IState, IPost } from './types';

const intialValues: IState = {
  id: null,
};

export default function PostDetail(props: IProps) {
  const { state, actions } = useState(intialValues, rawActions, props);
  const { getDetail, changeTitle } = actions;

  useCallback(() => {
    getDetail(props.id);
  }, []);

  return (
    <div>
      <p>
        post id: <span>{state.id}</span>
      </p>
      <p>
        post title: <span>{state.postDetail.title}</span>
      </p>
      <button onClick={changeTitle}>更新</button>
    </div>
  );
}

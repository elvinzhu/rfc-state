import React, { useEffect } from 'react';
// import useRfcState from 'rfc-state';
import useRfcState from '../../src';
import * as rawActions from './actions';
import { IProps, IState, IPost } from './types';

const intialValues: IState = {
  loading: false,
  id: null,
};

export default function PostDetail(props: IProps) {
  const { state, actions } = useRfcState(intialValues, rawActions, props);
  const { getDetail, changeTitle } = actions;

  if (state.loading) {
    return <div id="JS_loading">loading...</div>;
  }

  return (
    <div>
      <p>
        title: <span id="JS_title">{state.postDetail?.title}</span>
      </p>
      <button id="JS_btn1" onClick={getDetail}>
        加载
      </button>
      <button id="JS_btn2" onClick={changeTitle}>
        更新
      </button>
    </div>
  );
}

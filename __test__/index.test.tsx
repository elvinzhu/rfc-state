/**
 * @jest-environment jsdom
 */

import { jest, describe, expect, test, it } from '@jest/globals';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import PostDetail from '../demo/PostDetail';
import { act } from 'react-dom/test-utils';

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

test('if async generator works fine', async () => {
  act(() => {
    render(<PostDetail id={1} />, container);
  });

  let button = document.querySelector('#JS_title');
  let loading = document.querySelector('#JS_loading');
  expect(loading).toBeNull();
  expect(button.textContent).toBe('');

  await sleep(100);

  button = document.querySelector('#JS_title');
  loading = document.querySelector('#JS_loading');
  expect(loading.textContent).toBe('loading...');
  expect(button).toBeNull();

  await sleep(301);

  button = document.querySelector('#JS_title');
  loading = document.querySelector('#JS_loading');
  expect(button.textContent).toBe('test-title');
  expect(loading).toBeNull();

  // act(() => {
  //   button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  // });

  // expect(onChange).toHaveBeenCalledTimes(1);
  // expect(button.innerHTML).toBe('Turn off');

  // act(() => {
  //   for (let i = 0; i < 5; i++) {
  //     button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  //   }
  // });

  // expect(onChange).toHaveBeenCalledTimes(6);
  // expect(button.innerHTML).toBe('Turn on');
});

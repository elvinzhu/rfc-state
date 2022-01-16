/**
 * @jest-environment jsdom
 */

import { jest, describe, expect, test, it } from '@jest/globals';
import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import PostDetail from '../demo/PostDetail';
import { render, fireEvent, act, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const sleep = (time: number) => {
  return new Promise<number>(resolve => {
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

test('intergration', async () => {
  render(<PostDetail id={1} />, container);

  // init ui sate
  let title = document.querySelector('#JS_title');
  let loading = document.querySelector('#JS_loading');
  expect(loading).toBeNull();
  expect(title.textContent).toBe('');

  let button = document.querySelector('#JS_btn1');
  fireEvent.click(button);

  // async thing is runing
  title = document.querySelector('#JS_title');
  loading = document.querySelector('#JS_loading');
  expect(loading.textContent).toBe('loading...');
  expect(title).toBeNull();

  // await async thing done
  await act(async () => {
    await sleep(10);
  });

  // ui rendered with data
  title = document.querySelector('#JS_title');
  loading = document.querySelector('#JS_loading');
  expect(title.textContent).toBe('test-title-1');
  expect(loading).toBeNull();
});

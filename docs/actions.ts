export function getDetail({ id }: { id: number }, test: string) {
  return Promise.resolve({
    id: 1,
    title: 'elvinzhu',
  });
}

export function deletePost({ id }: { id: number }) {
  return Promise.resolve();
}

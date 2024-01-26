export async function* toAsyncIterable<T>(iter: Iterable<T>): AsyncIterable<T> {
  for (const item of iter) {
    yield item;
  }
}

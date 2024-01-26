export interface AsyncPeekableStream<T, R = unknown> {
  putBack(...values: T[]): void;
  next(): Promise<IteratorResult<T, R>>;
}

export interface PeekableStream<T, R = unknown> {
  putBack(...values: T[]): void;
  next(): IteratorResult<T, R>;
}

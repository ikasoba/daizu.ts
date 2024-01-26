import { PeekableStream } from "./PeekableStream.js";

export class PeekStream<T, R = unknown> implements PeekableStream<T, R> {
  private buffer: T[] = [];
  private done?: IteratorReturnResult<R>;

  constructor(private iter: Iterator<T>) {}

  putBack(...values: T[]): void {
    this.buffer.push(...values);
  }

  next(): IteratorResult<T> {
    if (this.buffer.length) {
      return {
        done: false,
        value: this.buffer.shift()!,
      };
    } else if (!this.done) {
      const res = this.iter.next();

      if (res.done) {
        this.done = res;
      }

      return res;
    } else {
      return this.done;
    }
  }
}

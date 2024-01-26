import { AsyncCharStreamable } from "./CharStreamable.js";

export class AsyncCharStream implements AsyncCharStreamable {
  private buffer: string[] = [];
  public isDone = false;

  static from(iterable: Iterable<string> | AsyncIterable<string>) {
    if (typeof iterable == "string" || Symbol.iterator in iterable) {
      return new AsyncCharStream(iterable[Symbol.iterator]());
    } else {
      return new AsyncCharStream(iterable[Symbol.asyncIterator]());
    }
  }

  constructor(private iter: Iterator<string> | AsyncIterator<string>) {}

  get isCharStream(): true {
    return true;
  }

  putBack(...chars: string[]): void {
    this.buffer.push(...chars);
  }

  close() {
    this.isDone = true;
  }

  isEOS() {
    return this.isDone;
  }

  async next(): Promise<IteratorResult<string>> {
    if (this.isDone) {
      return {
        done: true,
        value: undefined,
      };
    } else if (this.buffer.length) {
      return {
        done: false,
        value: this.buffer.shift()!,
      };
    } else {
      const res = await this.iter.next();

      if (res.done) {
        this.isDone = true;
        return res;
      }

      this.putBack(res.value);

      return {
        done: false,
        value: this.buffer.shift()!,
      };
    }
  }
}

import { CharStreamable } from "./CharStreamable.js";

export class CharStream implements CharStreamable {
  private buffer: string[] = [];
  public isDone = false;

  static from(iterable: Iterable<string>) {
    return new CharStream(iterable[Symbol.iterator]());
  }

  constructor(private iter: Iterator<string>) {}

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

  next(): IteratorResult<string> {
    if (this.buffer.length) {
      return {
        done: false,
        value: this.buffer.shift()!,
      };
    } else if (this.isDone) {
      return {
        done: true,
        value: undefined,
      };
    } else {
      const res = this.iter.next();

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

import { AsyncPeekableStream } from "./AsyncPeekableStream.js";
import { PeekableStream } from "./PeekableStream.js";

export interface CharStreamable extends PeekableStream<string> {
  isCharStream: true;
  isEOS(): boolean;
}

export interface AsyncCharStreamable extends AsyncPeekableStream<string> {
  isCharStream: true;
  isEOS(): boolean;
}

import {
  AsyncCharStreamable,
  CharStreamable,
} from "../stream/CharStreamable.js";
import { ParserResult } from "./ParserResult.js";
import { EOS, NextCharacter, ParserType } from "./ParserType.js";
import { SourcePosition } from "./SourcePosition.js";

export function parseCharStream<T>(
  stream: CharStreamable,
  parser: ParserType<T>,
  pos: SourcePosition = { line: 0, column: 0 }
): ParserResult<T> {
  const g = parser(pos);

  let value: string | EOS | undefined;
  while (true) {
    const res = value ? g.next(value) : g.next();

    if (res.done) {
      return res.value;
    } else if (res.value == NextCharacter) {
      const charResult = stream.next();
      if (charResult.done) {
        value = EOS;
        continue;
      }

      value = charResult.value;
    } else {
      stream.putBack(res.value);
    }
  }
}

export async function parseAsyncCharStream<T>(
  stream: AsyncCharStreamable,
  parser: ParserType<T>,
  pos: SourcePosition = { line: 0, column: 0 }
): Promise<ParserResult<T>> {
  const g = parser(pos);

  let value: string | EOS | undefined;
  while (true) {
    const res = value ? g.next(value) : g.next();

    if (res.done) {
      return res.value;
    } else if (res.value == NextCharacter) {
      const charResult = await stream.next();
      if (charResult.done) {
        value = EOS;
        continue;
      }

      value = charResult.value;
    } else {
      stream.putBack(res.value);
    }
  }
}

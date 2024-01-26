import { AsyncCharStream } from "../stream/AsyncCharStream.js";
import { CharStream } from "../stream/CharStream.js";
import { ParserResult } from "./ParserResult.js";
import { ParserType } from "./ParserType.js";
import { SourcePosition } from "./SourcePosition.js";
import { parseAsyncCharStream, parseCharStream } from "./parseCharStream.js";

export function parse<T>(
  value: Iterable<string>,
  parser: ParserType<T>,
  pos: SourcePosition = { line: 0, column: 0 }
): ParserResult<T> {
  const stream = CharStream.from(value);

  return parseCharStream(stream, parser, pos);
}

export async function parseAsync<T>(
  value: AsyncIterable<string>,
  parser: ParserType<T>,
  pos: SourcePosition = { line: 0, column: 0 }
): Promise<ParserResult<T>> {
  const stream = AsyncCharStream.from(value);

  return parseAsyncCharStream(stream, parser, pos);
}

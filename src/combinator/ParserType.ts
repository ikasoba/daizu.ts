import { Ignored, ParserResult } from "./ParserResult.js";
import { SourcePosition } from "./SourcePosition.js";

export const NextCharacter = Symbol();
export type NextCharacter = typeof NextCharacter;

export const EOS = Symbol();
export type EOS = typeof EOS;

export type ParserType<T> = (
  position: SourcePosition
) => Generator<NextCharacter | string, ParserResult<T>, string | EOS>;

export type ExtractParserResultType<T> = T extends ParserType<infer R>
  ? R
  : T extends ParserResult<infer R>
  ? R
  : never;

export type ExtractParserResultTypeMap<T extends any[]> = T extends [
  infer T1,
  ...infer T2
]
  ? ExtractParserResultType<T1> extends infer R
    ? R extends Ignored
      ? ExtractParserResultTypeMap<T2>
      : [R, ...ExtractParserResultTypeMap<T2>]
    : []
  : T extends []
  ? []
  : [];

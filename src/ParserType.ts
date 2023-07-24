import {
  ErrResult,
  OkResult,
  ParserResult,
  UnwrapParserError,
  UnwrapParserResult,
} from "./ParserResult.js";
import { ParserState } from "./ParserState.js";

export type ParserType<R, E> = (
  src: string,
  index: number,
  state: ParserState
) => OkResult<R> | ErrResult<E>;

export type UnwrapParserResultFromTuple<T extends ParserType<any, any>[]> = {
  [K in keyof T]: UnwrapParserResult<ReturnType<T[K]>>;
};

export type UnwrapParserErrorFromTuple<T extends ParserType<any, any>[]> = {
  [K in keyof T]: UnwrapParserError<ReturnType<T[K]>>;
};

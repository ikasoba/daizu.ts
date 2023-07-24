import { TextRange } from "./TextRange.js";

export interface OkResult<T> {
  isOk: true;
  value: T;
  index: number;
  range: TextRange;
}
export interface ErrResult<T> {
  isOk: false;
  value: T;
}

export type ParserResult<R, E> =
  | (R extends never ? never : OkResult<R>)
  | (E extends never ? never : ErrResult<E>);

export const ParserResult = class {
  static ok<T>(
    value: T,
    index: number,
    range: TextRange
  ): ParserResult<T, never> {
    return { isOk: true, value, index, range } satisfies OkResult<T> as any;
  }

  static err(value: void): ParserResult<never, void>;
  static err<T>(value: T): ParserResult<never, T>;
  static err<T>(value: T): ParserResult<never, T> {
    return { isOk: false, value } satisfies ErrResult<T> as any;
  }
};

export type UnwrapParserResult<R extends ParserResult<any, any>> =
  R extends OkResult<infer T> ? T : never;

export type UnwrapParserError<R extends ParserResult<any, any>> =
  R extends ErrResult<infer T> ? T : never;

import { TextRange } from "./TextRange.js";

export type ParserResult<T> = OkResult<T> | FailResult;

export type OkResult<T> = {
  ok: true;
  value: T;
  range: TextRange;
};

export type FailResult = {
  ok: false;
};

export const Ignored = Symbol();
export type Ignored = typeof Ignored;

export function ok<T>(value: T, range: TextRange): OkResult<T> {
  return {
    ok: true,
    value,
    range,
  };
}

export function fail(): FailResult {
  return {
    ok: false,
  };
}

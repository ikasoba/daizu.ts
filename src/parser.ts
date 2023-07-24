import { ParserResult, UnwrapParserResult } from "./ParserResult.js";
import {
  ParserType,
  UnwrapParserErrorFromTuple,
  UnwrapParserResultFromTuple,
} from "./ParserType.js";
import { TextRange } from "./TextRange.js";

export const string =
  (str: string): ParserType<string, void> =>
  (src, i, state) => {
    if (src.startsWith(str, i)) {
      const range: TextRange = {
        startLine: state.startLine,
        startColumn: state.startColumn,
        endLine: state.startLine,
        endColumn: state.startColumn,
      };

      for (let i = 0; i < str.length; i++) {
        if (/[\r\n]/.test(str[i])) {
          range.endLine += 1;
          range.endColumn = 0;
        } else {
          range.endColumn += 1;
        }
      }

      return ParserResult.ok(str, i + str.length, range);
    } else {
      return ParserResult.err();
    }
  };

export const regexp = (pattern: string | RegExp): ParserType<string, void> => {
  if (typeof pattern == "string") {
    pattern = new RegExp(`^(?:${pattern})`);
  } else {
    pattern = new RegExp(`^(?:${pattern.source})`, pattern.flags);
  }

  return (src, i, state) => {
    let m;
    if ((m = src.slice(i).match(pattern))) {
      const range: TextRange = {
        startLine: state.startLine,
        startColumn: state.startColumn,
        endLine: state.startLine,
        endColumn: state.startColumn,
      };

      for (let i = 0; i < m[0].length; i++) {
        if (/[\r\n]/.test(m[0][i])) {
          range.endLine += 1;
          range.endColumn = 0;
        } else {
          range.endColumn += 1;
        }
      }

      return ParserResult.ok(m[1] ?? m[0], i + m[0].length, range);
    } else {
      return ParserResult.err();
    }
  };
};

export const tuple =
  <T extends ParserType<any, any>[]>(
    ...parsers: T
  ): ParserType<
    UnwrapParserResultFromTuple<T>,
    UnwrapParserErrorFromTuple<T>[number]
  > =>
  (src, i, _state) => {
    let result = [];
    const state = { ..._state };

    const range: TextRange = {
      startLine: state.startLine,
      startColumn: state.startColumn,
      endLine: state.startLine,
      endColumn: state.startColumn,
    };

    for (const parser of parsers) {
      const tmp = parser(src, i, state);
      if (!tmp.isOk) return tmp;

      result.push(tmp.value);
      i = tmp.index;
      range.endLine = tmp.range.endLine;
      range.endColumn = tmp.range.endColumn;

      state.startLine = tmp.range.endLine;
      state.startColumn = tmp.range.endColumn;
    }

    return ParserResult.ok(result as any, i, range);
  };

export const many0 =
  <R, E>(parser: ParserType<R, E>): ParserType<R[], E> =>
  (src, i, _state) => {
    const result = [];
    const state = { ..._state };

    const range: TextRange = {
      startLine: state.startLine,
      startColumn: state.startColumn,
      endLine: state.startLine,
      endColumn: state.startColumn,
    };

    while (i < src.length) {
      const tmp = parser(src, i, state);
      if (!tmp.isOk) return tmp;

      result.push(tmp.value);
      i = tmp.index;
      range.endLine = tmp.range.endLine;
      range.endColumn = tmp.range.endColumn;

      state.startLine = tmp.range.endLine;
      state.startColumn = tmp.range.endColumn;
    }

    return ParserResult.ok(result, i, range);
  };

export const many1 =
  <R, E>(parser: ParserType<R, E>): ParserType<R[], E | void> =>
  (src, i, _state) => {
    const result = [];
    const state = { ..._state };

    const range: TextRange = {
      startLine: state.startLine,
      startColumn: state.startColumn,
      endLine: state.startLine,
      endColumn: state.startColumn,
    };

    while (i < src.length) {
      const tmp = parser(src, i, state);
      if (!tmp.isOk) return tmp;

      result.push(tmp.value);
      i = tmp.index;
      range.endLine = tmp.range.endLine;
      range.endColumn = tmp.range.endColumn;

      state.startLine = tmp.range.endLine;
      state.startColumn = tmp.range.endColumn;
    }

    if (result.length <= 0) return ParserResult.err();

    return ParserResult.ok(result, i, range);
  };

export const choice =
  <T extends ParserType<any, any>[]>(
    ...parsers: T
  ): ParserType<
    UnwrapParserResultFromTuple<T>[number],
    UnwrapParserErrorFromTuple<T>[number] | void
  > =>
  (src, i, state) => {
    let lastError;

    for (const parser of parsers) {
      const tmp = parser(src, i, state);
      if (tmp.isOk) return tmp;
      lastError = tmp;
    }

    return lastError ?? ParserResult.err();
  };

export const createRef = <R, E>(): ParserType<R, E> & {
  ref: ParserType<R, E>;
} => {
  const parser: ParserType<R, E> & { ref?: ParserType<R, E> } = (
    src,
    i,
    state
  ) => parser.ref!(src, i, state);
  return parser as any;
};

export const map =
  <R, E, T>(
    parser: ParserType<R, E>,
    fn: (value: R, index: number, range: TextRange) => T
  ): ParserType<T, E> =>
  (src, i, state) => {
    const tmp = parser(src, i, state);
    if (!tmp.isOk) return tmp;
    i = tmp.index;

    return ParserResult.ok(fn(tmp.value, i, tmp.range), i, tmp.range);
  };

export const ignore =
  <E>(parser: ParserType<any, E>): ParserType<void, E> =>
  (src, i, state) => {
    const tmp = parser(src, i, state);
    if (!tmp.isOk) return tmp;

    return ParserResult.ok(void 0, tmp.index, tmp.range);
  };

export const until =
  (parser: ParserType<any, any>): ParserType<string, void> =>
  (src, i, _state) => {
    let result = "";
    const state = { ..._state };

    const range: TextRange = {
      startLine: state.startLine,
      startColumn: state.startColumn,
      endLine: state.startLine,
      endColumn: state.startColumn,
    };

    while (true) {
      const tmp = parser(src, i, state);
      if (i >= src.length || tmp.isOk) {
        if (result.length == 0) {
          return ParserResult.err();
        } else {
          return ParserResult.ok(result, i, range);
        }
      }

      if (/[\r\n]/.test(src[i])) {
        range.endLine += 1;
        range.endColumn = 0;
      } else {
        range.endColumn += 1;
      }

      result += src[i];
      i += 1;
    }
  };

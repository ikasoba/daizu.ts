import { isNot } from "../utils/typing.js";
import { Ignored, OkResult, ParserResult, fail, ok } from "./ParserResult.js";
import {
  EOS,
  ExtractParserResultType,
  ExtractParserResultTypeMap,
  NextCharacter,
  ParserType,
} from "./ParserType.js";
import { TextRange } from "./TextRange.js";

export function anyChar(): ParserType<string> {
  return function* (pos) {
    const src = yield NextCharacter;

    if (src == EOS) return fail();

    return ok(src, {
      startLine: pos.line,
      startColumn: pos.column,
      endLine: /[\r\n]/.test(src) ? pos.line + 1 : pos.line,
      endColumn: /[\r\n]/.test(src) ? 0 : pos.column + 1,
    });
  };
}

export function anyOf(chars: string): ParserType<string> {
  return function* (pos) {
    const src = yield NextCharacter;

    if (src == EOS) return fail();

    if (chars.includes(src)) {
      return ok(src, {
        startLine: pos.line,
        startColumn: pos.column,
        endLine: /[\r\n]/.test(src) ? pos.line + 1 : pos.line,
        endColumn: /[\r\n]/.test(src) ? 0 : pos.column + 1,
      });
    } else {
      yield src;
      return fail();
    }
  };
}

export function noneOf(chars: string): ParserType<string> {
  return function* (pos) {
    const src = yield NextCharacter;

    if (src == EOS) return fail();

    if (!chars.includes(src)) {
      return ok(src, {
        startLine: pos.line,
        startColumn: pos.column,
        endLine: /[\r\n]/.test(src) ? pos.line + 1 : pos.line,
        endColumn: /[\r\n]/.test(src) ? 0 : pos.column + 1,
      });
    } else {
      yield src;
      return fail();
    }
  };
}

export function charRange(_a: string, _b: string): ParserType<string> {
  const a = _a.codePointAt(0)!;
  const b = _b.codePointAt(0)!;

  return function* (pos) {
    const src = yield NextCharacter;

    if (src == EOS) return fail();

    if (src.codePointAt(0)! >= a && src.codePointAt(0)! <= b) {
      return ok(src, {
        startLine: pos.line,
        startColumn: pos.column,
        endLine: /[\r\n]/.test(src) ? pos.line + 1 : pos.line,
        endColumn: /[\r\n]/.test(src) ? 0 : pos.column + 1,
      });
    } else {
      yield src;
      return fail();
    }
  };
}

export function string<T extends string>(text: T): ParserType<T> {
  const lines = text.split(/\r\n|\r|\n/);
  const line = lines.length - 1;
  const column = line > 0 ? lines[lines.length - 1].length : null;

  const chars = [...text];

  return function* (pos) {
    const chunks: string[] = [];

    for (let i = 0; i < chars.length; i++) {
      const src = yield NextCharacter;

      if (src == EOS) return fail();

      const char = chars[i];

      chunks.push(src);

      if (src != char) {
        for (const chunk of chunks) yield chunk;

        return fail();
      }
    }

    return ok(text, {
      startLine: pos.line,
      startColumn: pos.column,
      endLine: pos.line + line,
      endColumn: column ?? pos.column + text.length,
    });
  };
}

export function choice<A extends ParserType<any>[]>(
  ...parsers: A
): ParserType<ExtractParserResultType<A[number]>> {
  return function* (pos) {
    for (const parser of parsers) {
      const res = yield* parser(pos);

      if (res.ok) return res;
    }

    return fail();
  };
}

export function map<P extends ParserType<any>, R>(
  parser: P,
  fn: (value: ExtractParserResultType<P>, range: TextRange) => R
): ParserType<R> {
  return function* (pos) {
    const res = yield* parser(pos);

    if (res.ok) {
      return ok(fn(res.value, res.range), res.range);
    } else {
      return res;
    }
  };
}

export function opt<T>(parser: ParserType<T>): ParserType<T | undefined> {
  return function* (pos) {
    const res = yield* parser(pos);

    if (res.ok) {
      return res;
    } else {
      return ok(undefined, {
        startLine: pos.line,
        startColumn: pos.column,
        endLine: pos.line,
        endColumn: pos.column,
      });
    }
  };
}

export function ignore<P extends ParserType<any>>(
  parser: P
): ParserType<Ignored> {
  return function* (pos) {
    const res = yield* parser(pos);

    if (res.ok) {
      return ok(Ignored, res.range);
    } else {
      return res;
    }
  };
}

export function many0<T>(
  parser: ParserType<T>
): ParserType<Exclude<T, Ignored>[]> {
  return function* (pos) {
    const startPos = pos;
    const results = [];
    let lastResult: OkResult<T> | undefined;

    while (true) {
      const res = yield* parser(pos);

      if (res.ok) {
        lastResult = res;
        if (isNot(res.value, Ignored)) {
          results.push(res.value);
        }

        pos = {
          line: res.range.endLine,
          column: res.range.endColumn,
        };
        continue;
      }

      return ok(results, {
        startLine: startPos.line,
        startColumn: startPos.column,
        endLine: lastResult?.range.endLine ?? startPos.line,
        endColumn: lastResult?.range.endColumn ?? startPos.column,
      });
    }
  };
}

export function many1<T>(
  parser: ParserType<T>
): ParserType<Exclude<T, Ignored>[]> {
  return function* (pos) {
    const startPos = pos;
    const res = yield* parser(pos);

    if (!res.ok) return res;

    const results: Exclude<T, Ignored>[] = [];
    let lastResult: OkResult<T> = res;

    if (isNot(res.value, Ignored)) {
      results.push(res.value);
    }

    pos = {
      line: res.range.endLine,
      column: res.range.endColumn,
    };

    while (true) {
      const res = yield* parser(pos);

      if (res.ok) {
        lastResult = res;
        if (isNot(res.value, Ignored)) {
          results.push(res.value);
        }

        pos = {
          line: res.range.endLine,
          column: res.range.endColumn,
        };

        continue;
      }

      return ok(results, {
        startLine: startPos.line,
        startColumn: startPos.column,
        endLine: lastResult.range.endLine,
        endColumn: lastResult.range.endColumn,
      });
    }
  };
}

export function tuple<A extends ParserType<any>[]>(
  ...parsers: A
): ParserType<ExtractParserResultTypeMap<A>> {
  return function* (pos) {
    const startPos = pos;
    const previousChunks: string[] = [];
    const results: any = [];
    let lastResult: OkResult<any>;

    for (const parser of parsers) {
      const chunks: string[] = [];
      const g = parser(pos);

      let value: string | EOS | undefined;
      while (true) {
        const res = value ? g.next(value) : g.next();

        if (res.done) {
          if (res.value.ok) {
            lastResult = res.value;

            if (res.value.value !== Ignored) results.push(res.value.value);
            previousChunks.push(...chunks);

            pos = {
              line: res.value.range.endLine,
              column: res.value.range.endColumn,
            };

            break;
          } else {
            for (const chunk of previousChunks) yield chunk;

            return fail();
          }
        } else if (res.value == NextCharacter) {
          value = yield res.value;

          if (value != EOS) {
            chunks.push(value);
          }
        } else {
          value = undefined;
          yield res.value;
        }
      }
    }

    return ok(results, {
      startLine: startPos.line,
      startColumn: startPos.column,
      endLine: lastResult!.range.endLine,
      endColumn: lastResult!.range.endColumn,
    });
  };
}

export function eos(): ParserType<Ignored> {
  return function* (pos) {
    const res = yield NextCharacter;
    if (res === EOS) {
      return ok(Ignored, {
        startLine: pos.line,
        startColumn: pos.column,
        endLine: pos.line,
        endColumn: pos.column,
      });
    } else {
      return fail();
    }
  };
}

export function rec<T>(
  fn: (self: ParserType<T>) => ParserType<T>
): ParserType<T> {
  let parser: ParserType<T> | undefined;

  const self: ParserType<T> = function* (pos) {
    parser ??= fn(self);

    return yield* parser(pos);
  };

  return self;
}

export function between<T>(
  pOpen: ParserType<unknown>,
  pClose: ParserType<unknown>,
  body: ParserType<T>
): ParserType<T> {
  return function* (pos) {
    const startPos = pos;

    let _ = yield* pOpen(pos);
    if (!_.ok) return _;
    pos = { line: _.range.endLine, column: _.range.endColumn };

    const res = yield* body(pos);
    if (!res.ok) return res;
    pos = { line: res.range.endLine, column: res.range.endColumn };

    _ = yield* pClose(pos);
    if (!_.ok) return _;

    return ok(res.value, {
      startLine: startPos.line,
      startColumn: startPos.column,
      endLine: _.range.endLine,
      endColumn: _.range.endColumn,
    });
  };
}

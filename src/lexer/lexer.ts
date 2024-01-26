import { Ignored } from "../combinator/ParserResult.js";
import {
  ExtractParserResultType,
  NextCharacter,
  ParserType,
} from "../combinator/ParserType.js";
import { TextRange } from "../combinator/TextRange.js";
import { choice, map } from "../combinator/combinator.js";
import {
  parseAsyncCharStream,
  parseCharStream,
} from "../combinator/parseCharStream.js";
import {
  AsyncCharStreamable,
  CharStreamable,
} from "../stream/CharStreamable.js";
import { isNot } from "../utils/typing.js";

export type NamedSymbol<T> = symbol & { description: T };

export type SymbolEnum<T> = {
  [K in keyof T]: NamedSymbol<K>;
};

export type Tokens<T, S extends SymbolEnum<T>> = {
  [K in keyof T]: ExtractParserResultType<T[K]> extends Ignored
    ? never
    : Token<S[K], ExtractParserResultType<T[K]>>;
}[keyof T];

export type TokenParser<T, S extends SymbolEnum<T>> = ParserType<Tokens<T, S>>;

export interface Token<Kind extends symbol, T> {
  kind: Kind;
  value: T;
  range: TextRange;
}

export interface LexerBase<T> {
  symbols: SymbolEnum<T>;
}

export interface Lexer<T> extends LexerBase<T> {
  lex(stream: CharStreamable): Generator<Tokens<T, SymbolEnum<T>>>;
}

export interface AsyncLexer<T> extends LexerBase<T> {
  lex(stream: AsyncCharStreamable): AsyncGenerator<Tokens<T, SymbolEnum<T>>>;
}

export function defineLexer<P extends { [k: string]: ParserType<any> }>(
  parsers: P
): Lexer<P> {
  const tokenSymbols = Object.fromEntries(
    Object.keys(parsers).map((k) => [k, Symbol(k)] as const)
  ) as SymbolEnum<P>;

  const parser = choice(
    ...Object.entries(parsers).map(([k, p]) =>
      map(
        p,
        (value, range) =>
          ({
            kind: tokenSymbols[k],
            value,
            range,
          } satisfies Token<symbol, unknown>)
      )
    )
  ) as TokenParser<P, SymbolEnum<P>>;

  return {
    symbols: tokenSymbols,
    *lex(stream) {
      let pos = {
        line: 0,
        column: 0,
      };

      do {
        const res = parseCharStream(stream, parser, pos);

        if (res.ok) {
          if (isNot(res.value.value, Ignored)) yield res.value;

          pos = {
            line: res.range.endLine,
            column: res.range.endColumn,
          };

          continue;
        }

        break;
      } while (!stream.isEOS());
    },
  };
}

export function defineAsyncLexer<P extends { [k: string]: ParserType<any> }>(
  parsers: P
): AsyncLexer<P> {
  const tokenSymbols = Object.fromEntries(
    Object.keys(parsers).map((k) => [k, Symbol(k)] as const)
  ) as SymbolEnum<P>;

  const parser = choice(
    ...Object.entries(parsers).map(([k, p]) =>
      map(
        p,
        (value, range) =>
          ({
            kind: tokenSymbols[k],
            value,
            range,
          } satisfies Token<symbol, unknown>)
      )
    )
  ) as TokenParser<P, SymbolEnum<P>>;

  return {
    symbols: tokenSymbols,
    async *lex(stream) {
      let pos = {
        line: 0,
        column: 0,
      };

      do {
        const res = await parseAsyncCharStream(stream, parser, pos);

        if (res.ok) {
          if (isNot(res.value.value, Ignored)) yield res.value;

          pos = {
            line: res.range.endLine,
            column: res.range.endColumn,
          };

          continue;
        }

        break;
      } while (!stream.isEOS());
    },
  };
}

import { describe, test, expect } from "vitest";
import {
  charRange,
  choice,
  eos,
  ignore,
  many0,
  many1,
  map,
  opt,
  string,
  tuple,
} from "../src/combinator/combinator.js";
import { defineAsyncLexer, defineLexer } from "../src/lexer/lexer.js";
import { CharStream } from "../src/stream/CharStream.js";
import { AsyncCharStream } from "../src/stream/AsyncCharStream.js";
import { toAsyncIterable } from "../src/utils/toAsyncIterable.js";
import { ExtractParserResultType } from "../src/combinator/ParserType.js";

test("test lexer", () => {
  const digit = map(many1(charRange("0", "9")), (x) => x.join(""));
  const numeric = map(
    tuple(digit, opt(tuple(ignore(string(".")), digit))),
    ([x, y]) => parseFloat(`${x}.${y?.[0] ?? "0"}`)
  );

  const addSymbol = string("+");
  const subSymbol = string("-");
  const divSymbol = string("/");
  const mulSymbol = string("*");

  const whiteSpace = ignore(many0(string(" ")));

  const lexer = defineLexer({
    numeric,
    addSymbol,
    subSymbol,
    divSymbol,
    mulSymbol,
    whiteSpace,
  });

  expect([...lexer.lex(CharStream.from("1 + 0.5 * 2"))]).eql([
    {
      kind: lexer.symbols.numeric,
      range: {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 1,
      },
      value: 1,
    },
    {
      kind: lexer.symbols.addSymbol,
      range: {
        startLine: 0,
        startColumn: 2,
        endLine: 0,
        endColumn: 3,
      },
      value: "+",
    },
    {
      kind: lexer.symbols.numeric,
      range: {
        startLine: 0,
        startColumn: 4,
        endLine: 0,
        endColumn: 7,
      },
      value: 0.5,
    },
    {
      kind: lexer.symbols.mulSymbol,
      range: {
        startLine: 0,
        startColumn: 8,
        endLine: 0,
        endColumn: 9,
      },
      value: "*",
    },
    {
      kind: lexer.symbols.numeric,
      range: {
        startLine: 0,
        startColumn: 10,
        endLine: 0,
        endColumn: 11,
      },
      value: 2,
    },
  ]);
});

test("test async lexer", async () => {
  const digit = map(many1(charRange("0", "9")), (x) => x.join(""));
  const numeric = map(
    tuple(digit, opt(tuple(ignore(string(".")), digit))),
    ([x, y]) => parseFloat(`${x}.${y?.[0] ?? "0"}`)
  );

  const addSymbol = string("+");
  const subSymbol = string("-");
  const divSymbol = string("/");
  const mulSymbol = string("*");

  const whiteSpace = ignore(many0(string(" ")));

  const lexer = defineAsyncLexer({
    numeric,
    addSymbol,
    subSymbol,
    divSymbol,
    mulSymbol,
    whiteSpace,
  });

  const res = [];
  for await (const token of lexer.lex(
    AsyncCharStream.from(toAsyncIterable("1 + 0.5 * 2"))
  )) {
    res.push(token);
  }

  expect(res).eql([
    {
      kind: lexer.symbols.numeric,
      range: {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 1,
      },
      value: 1,
    },
    {
      kind: lexer.symbols.addSymbol,
      range: {
        startLine: 0,
        startColumn: 2,
        endLine: 0,
        endColumn: 3,
      },
      value: "+",
    },
    {
      kind: lexer.symbols.numeric,
      range: {
        startLine: 0,
        startColumn: 4,
        endLine: 0,
        endColumn: 7,
      },
      value: 0.5,
    },
    {
      kind: lexer.symbols.mulSymbol,
      range: {
        startLine: 0,
        startColumn: 8,
        endLine: 0,
        endColumn: 9,
      },
      value: "*",
    },
    {
      kind: lexer.symbols.numeric,
      range: {
        startLine: 0,
        startColumn: 10,
        endLine: 0,
        endColumn: 11,
      },
      value: 2,
    },
  ]);
});

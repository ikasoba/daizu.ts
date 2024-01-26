import { describe, test, expect } from "vitest";
import { faker } from "@faker-js/faker";
import {
  charRange,
  choice,
  eos,
  ignore,
  many0,
  many1,
  map,
  opt,
  rec,
  string,
  tuple,
} from "../src/combinator/combinator.js";
import { parseCharStream } from "../src/combinator/parseCharStream.js";
import { parse } from "../src/combinator/parse.js";
import { CharStream } from "../src/stream/CharStream.js";
import { ParserResult } from "../src/combinator/ParserResult.js";
import { ParserType } from "../src/combinator/ParserType.js";

test("test range", () => {
  const parser = charRange("A", "Z");

  const alphabets = faker.string.alpha({
    casing: "upper",
    length: { min: 1, max: 32 },
  });

  for (const char of alphabets) {
    expect(parseCharStream(CharStream.from(char), parser)).eql({
      ok: true,
      value: char,
      range: {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 1,
      },
    } satisfies ParserResult<string>);
  }

  expect(parseCharStream(CharStream.from("/"), parser)).eql({
    ok: false,
  } satisfies ParserResult<string>);
});

test("test many0", () => {
  const parser = many0(charRange("A", "Z"));

  const alphabets = faker.string.alpha({
    casing: "upper",
    length: { min: 1, max: 32 },
  });

  expect(parseCharStream(CharStream.from(alphabets), parser)).eql({
    ok: true,
    value: [...alphabets],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: alphabets.length,
    },
  } satisfies ParserResult<string[]>);

  const digits = faker.string.numeric({
    length: { min: 1, max: 32 },
  });

  expect(parseCharStream(CharStream.from(digits), parser)).eql({
    ok: true,
    value: [],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 0,
    },
  } satisfies ParserResult<string[]>);

  expect(parseCharStream(CharStream.from(""), parser)).eql({
    ok: true,
    value: [],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 0,
    },
  } satisfies ParserResult<string[]>);
});

test("test many1", () => {
  const parser = many1(charRange("A", "Z"));

  const alphabets = faker.string.alpha({
    casing: "upper",
    length: { min: 1, max: 32 },
  });

  expect(parseCharStream(CharStream.from(alphabets), parser)).eql({
    ok: true,
    value: [...alphabets],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: alphabets.length,
    },
  } satisfies ParserResult<string[]>);

  const digits = faker.string.numeric({
    length: { min: 1, max: 32 },
  });

  expect(parseCharStream(CharStream.from(digits), parser)).eql({
    ok: false,
  } satisfies ParserResult<string[]>);

  expect(parseCharStream(CharStream.from(""), parser)).eql({
    ok: false,
  } satisfies ParserResult<string[]>);
});

test("test string", () => {
  const parser = string("hogefuga");

  expect(parseCharStream(CharStream.from("hogefuga"), parser)).eql({
    ok: true,
    value: "hogefuga",
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 8,
    },
  } satisfies ParserResult<string>);

  expect(parseCharStream(CharStream.from("foobar"), parser)).eql({
    ok: false,
  } satisfies ParserResult<string>);
});

test("test choice", () => {
  const items = ["hoge", "fuga", "piyo"];
  const parser = choice(...items.map((x) => string(x)));

  for (const item of items) {
    expect(parseCharStream(CharStream.from(item), parser)).eql({
      ok: true,
      value: item,
      range: {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 4,
      },
    } satisfies ParserResult<string>);
  }

  expect(parseCharStream(CharStream.from("foo"), parser)).eql({
    ok: false,
  } satisfies ParserResult<string>);

  expect(parseCharStream(CharStream.from("bar"), parser)).eql({
    ok: false,
  } satisfies ParserResult<string>);

  expect(parseCharStream(CharStream.from("baz"), parser)).eql({
    ok: false,
  } satisfies ParserResult<string>);
});

test("test map", () => {
  const integer = many1(charRange("0", "9"));
  const parser = map(integer, (x) => parseInt(x.join("")));

  expect(parseCharStream(CharStream.from("5432"), parser)).eql({
    ok: true,
    value: 5432,
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 4,
    },
  } satisfies ParserResult<number>);

  expect(parseCharStream(CharStream.from("foo"), parser)).eql({
    ok: false,
  } satisfies ParserResult<number>);

  expect(parseCharStream(CharStream.from("bar"), parser)).eql({
    ok: false,
  } satisfies ParserResult<number>);

  expect(parseCharStream(CharStream.from("baz"), parser)).eql({
    ok: false,
  } satisfies ParserResult<number>);
});

test("test opt", () => {
  const parser = tuple(string("A"), opt(string("B")), string("C"));

  expect(parse("ABC", parser)).eql({
    ok: true,
    value: ["A", "B", "C"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 3,
    },
  } satisfies ParserResult<(string | undefined)[]>);

  expect(parse("AC", parser)).eql({
    ok: true,
    value: ["A", undefined, "C"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 2,
    },
  } satisfies ParserResult<(string | undefined)[]>);

  expect(parseCharStream(CharStream.from("BC"), parser)).eql({
    ok: false,
  } satisfies ParserResult<number>);
});

test("test tuple", () => {
  const parser0 = tuple(string("A"), string("B"), string("C"));

  expect(parseCharStream(CharStream.from("ABC"), parser0)).eql({
    ok: true,
    value: ["A", "B", "C"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 3,
    },
  } satisfies ParserResult<string[]>);

  expect(parseCharStream(CharStream.from("ACB"), parser0)).eql({
    ok: false,
  } satisfies ParserResult<string[]>);

  expect(parseCharStream(CharStream.from("ABE"), parser0)).eql({
    ok: false,
  } satisfies ParserResult<string[]>);

  const parser1 = tuple(many1(string("A")), string("B"), string("C"));

  expect(parseCharStream(CharStream.from("AAAAAAAAAAAAABC"), parser1)).eql({
    ok: true,
    value: [[..."AAAAAAAAAAAAA"], "B", "C"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 15,
    },
  });

  expect(parseCharStream(CharStream.from("ACB"), parser1)).eql({
    ok: false,
  } satisfies ParserResult<string[]>);

  expect(parseCharStream(CharStream.from("ABE"), parser1)).eql({
    ok: false,
  } satisfies ParserResult<string[]>);
});

test("test ignore", () => {
  const element = choice(
    ignore(string("A")),
    string("B"),
    ignore(string("C")),
    string("D")
  );

  const parser0 = many0(element) satisfies ParserType<("B" | "D")[]>;
  const parser1 = many1(element) satisfies ParserType<("B" | "D")[]>;
  const parser2 = tuple(element) satisfies ParserType<[] | ["B"] | ["D"]>;

  expect(parseCharStream(CharStream.from("ABCD"), parser0)).eql({
    ok: true,
    value: ["B", "D"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 4,
    },
  } satisfies ParserResult<string[]>);

  expect(parseCharStream(CharStream.from("ABCD"), parser1)).eql({
    ok: true,
    value: ["B", "D"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 4,
    },
  } satisfies ParserResult<string[]>);

  expect(parseCharStream(CharStream.from("A"), parser2)).eql({
    ok: true,
    value: [],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 1,
    },
  } satisfies ParserResult<string[]>);

  expect(parseCharStream(CharStream.from("B"), parser2)).eql({
    ok: true,
    value: ["B"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 1,
    },
  } satisfies ParserResult<string[]>);
});

test("test eos", () => {
  const parser = tuple(many0(charRange("a", "z")), eos());

  expect(parse("abcdef", parser)).eql({
    ok: true,
    value: [[..."abcdef"]],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 6,
    },
  } satisfies ParserResult<[string[]]>);

  expect(parse("qwertyuiop@", parser)).eql({
    ok: false,
  });
});

test("test rec", () => {
  const parser = rec<("A" | "B")[]>((parser) =>
    choice(
      map(tuple(choice(string("A"), string("B")), opt(parser)), ([x, y]) => [
        x,
        ...(y ?? []),
      ])
    )
  );

  expect(parse("A", parser)).eql({
    ok: true,
    value: ["A"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 1,
    },
  } satisfies ParserResult<string[]>);

  expect(parse("B", parser)).eql({
    ok: true,
    value: ["B"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 1,
    },
  } satisfies ParserResult<string[]>);

  expect(parse("ABAB", parser)).eql({
    ok: true,
    value: ["A", "B", "A", "B"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 4,
    },
  } satisfies ParserResult<string[]>);

  expect(parse("AABB", parser)).eql({
    ok: true,
    value: ["A", "A", "B", "B"],
    range: {
      startLine: 0,
      startColumn: 0,
      endLine: 0,
      endColumn: 4,
    },
  } satisfies ParserResult<string[]>);
});

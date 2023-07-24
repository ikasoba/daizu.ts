import { describe, expect, test } from "vitest";
import {
  ignore,
  map,
  createRef,
  regexp,
  string,
  tuple,
  choice,
  until,
  many0,
} from "../src/parser";

test("CST", () => {
  const code = "1 + 2 unko++ hoge\n 3 - 3 hogehoge.com 3 - 2";

  type Tree =
    | {
        type: "num";
        value: number;
      }
    | {
        type: "add";
        left: Tree;
        right: Tree;
      }
    | {
        type: "sub";
        left: Tree;
        right: Tree;
      }
    | {
        type: "err";
        value: string;
      };

  const ws = ignore(regexp(/\s*/));

  const number = map(
    regexp(/[0-9]+/),
    (x): Tree => ({
      type: "num",
      value: parseInt(x),
    })
  );

  const strictExpr = createRef<Tree, void>();

  const addOperator = map(
    tuple(number, ws, string("+"), ws, strictExpr),
    (x): Tree => ({
      type: "add",
      left: x[0],
      right: x[4],
    })
  );

  const subOperator = map(
    tuple(number, ws, string("-"), ws, strictExpr),
    (x): Tree => ({
      type: "sub",
      left: x[0],
      right: x[4],
    })
  );

  strictExpr.ref = choice(addOperator, subOperator, number);

  const parseError = map(
    until(strictExpr),
    (x): Tree => ({ type: "err", value: x })
  );

  const expr = many0(choice(strictExpr, parseError));

  const res = expr(code, 0, { startLine: 0, startColumn: 0 });

  expect(res.isOk).eq(true);
  if (res.isOk != true) throw "dummy";

  expect(res.value).deep.eq([
    {
      type: "add",
      left: {
        type: "num",
        value: 1,
      },
      right: {
        type: "num",
        value: 2,
      },
    },
    {
      type: "err",
      value: " unko++ hoge\n ",
    },
    {
      type: "sub",
      left: {
        type: "num",
        value: 3,
      },
      right: {
        type: "num",
        value: 3,
      },
    },
    {
      type: "err",
      value: " hogehoge.com ",
    },
    {
      type: "sub",
      left: {
        type: "num",
        value: 3,
      },
      right: {
        type: "num",
        value: 2,
      },
    },
  ] satisfies Tree[]);
});

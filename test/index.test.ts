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

  expect(res.index).eq(code.length);

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

test("calculator", () => {
  type Tree =
    | number
    | {
        type: "op";
        name: string;
        priority: number;
        left: Tree;
        right: Tree;
      }
    | {
        type: "roundBrackets";
        expr: Tree;
      };

  const ws = ignore(regexp(/\s*/));

  const expr = createRef<Tree, void>();

  const num =
    map(regexp(/(?:[1-9][0-9]+|[0-9])(?:\.[0-9]+)?/), (x) =>
    parseFloat(x)
  );
  
  const roundBrackets = map(
    tuple(string("("), ws, expr, ws, string(")")),
    ([_, __, x]): Tree => ({
      type: "roundBrackets",
      expr: x,
    })
  );

  const operatorParser = (name: string, priority: number) =>
    map(
      tuple(choice(num, roundBrackets), ws, string(name), ws, expr),
      ([left, _, __, ___, right]): Tree => {
        if (
          typeof right != "number" &&
          right.type == "op" &&
          priority > right.priority
        ) {
          right.left = {
            type: "op",
            name,
            priority,
            left,
            right: right.left,
          };

          return right;
        }

        return {
          type: "op",
          name,
          priority,
          left,
          right,
        };
      }
    );

  const add = operatorParser("+", 0);
  const sub = operatorParser("-", 0);
  const mul = operatorParser("*", 1);
  const div = operatorParser("/", 1);

  expr.ref = choice(add, sub, mul, div, roundBrackets, num);

  const evaluateTree = (expr: Tree): number => {
    if (typeof expr == "number") {
      return expr;
    } else if (expr.type == "op") {
      const left = evaluateTree(expr.left);
      const right = evaluateTree(expr.right);

      if (expr.name == "+") return left + right;
      if (expr.name == "-") return left - right;
      if (expr.name == "*") return left * right;
      if (expr.name == "/") return left / right;

      throw "Unexpected.";
    } else {
      return evaluateTree(expr.expr);
    }
  };

  const ast = expr("3 * (4 / 2 + 1) - 1", 0, { startLine: 0, startColumn: 0 });

  expect(ast.isOk).eq(true);
  if (!ast.isOk) throw "dummy";

  expect(evaluateTree(ast.value)).eq(8);
});

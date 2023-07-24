<h1>
  <p align="center">
    ٩(๑òωó๑)۶<br/><br/>
    <a href="https://www.npmjs.com/package/@ikasoba000/daizu">
      @ikasoba000/daizu
    </a>
  </p>
</h1>

<p align="center">
  daizu is simple parser combinator library.
</p>

# installation

```
pnpm i @ikasoba000/daizu
```

# Hello, world!
```ts
import * as D from "@ikasoba000/daizu";

const parser = D.string("Hello, world!")

D.parse(parser, "Hello, world!") // "Hello, world!"



const parser = D.regexp(/Hello, \w+!/)

D.parse(parser, "Hello, daizu!") // "Hello, daizu!"



const parser = D.regexp(/Hello, (\w+)!/)

D.parse(parser, "Hello, daizu!") // "daizu"
```

# Calculator
```ts
import * as D from "@ikasoba000/daizu";

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

const ws = D.ignore(D.regexp(/\s*/));

const expr = D.createRef<Tree, void>();

const num =
  D.map(D.regexp(/(?:[1-9][0-9]+|[0-9])(?:\.[0-9]+)?/), (x) =>
  parseFloat(x)
);

const roundBrackets = D.map(
  D.tuple(D.string("("), ws, expr, ws, D.string(")")),
  ([_, __, x]): Tree => ({
    type: "roundBrackets",
    expr: x,
  })
);

const operatorParser = (name: string, priority: number) =>
  D.map(
    D.tuple(D.choice(num, roundBrackets), ws, D.string(name), ws, expr),
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

expr.ref = D.choice(add, sub, mul, div, roundBrackets, num);

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

expr("3 * (4 / 2 + 1) - 1", 0, { startLine: 0, startColumn: 0 }); // 8
```
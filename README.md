<h1>
  <p align="center">
    ٩(๑òωó๑)۶<br/><br/>
    <a href="https://www.npmjs.com/package/@ikasoba000/daizu">
      @ikasoba000/daizu
    </a>
  </p>
</h1>

<p align="center">
  <a href="https://npmjs.org/@ikasoba000/daizu">
    <img src="https://img.shields.io/npm/v/%40ikasoba000%2Fdaizu"/>
    <img src="https://img.shields.io/npm/l/%40ikasoba000%2Fdaizu"/>
  </a>
  <a href="https://codecov.io/gh/ikasoba/daizu.ts" >
    <img src="https://codecov.io/gh/ikasoba/daizu.ts/branch/main/graph/badge.svg?token=1ZJ3N5EF4A"/>
  </a>
</p>

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

const parser = D.string("Hello, world!");

D.parse(parser, "Hello, world!"); // "Hello, world!"

const parser = D.regexp(/Hello, \w+!/);

D.parse(parser, "Hello, daizu!"); // "Hello, daizu!"

const parser = D.regexp(/Hello, (\w+)!/);

D.parse(parser, "Hello, daizu!"); // "daizu"
```

# daizu/helper

```ts
import D from "@ikasoba000/daizu/helper";

D.string("a").many1(); // Matches aaaaaaaaaaaaaa...

const parser =
  D.choice(
    D.regexp(/[a-zA-Z]/).map(x => x.toLowerCase()),
    D.regexp(/\s*/).ignore()
  )
  .many0();

parser.parse("a b \n c    d e\n f") // "a", "b", "c", "d", "e", "f"
```

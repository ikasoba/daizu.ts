<h1>
  <p align="center">
    ٩(๑òωó๑)۶<br/><br/>
    <a href="https://www.npmjs.com/package/@ikasoba000/daizu">
      @ikasoba000/daizu
    </a>
  </p>
</h1>

<p align="center">
  <img src="https://img.shields.io/npm/v/%40ikasoba000%2Fdaizu"/>
  <img src="https://img.shields.io/npm/l/%40ikasoba000%2Fdaizu"/>
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

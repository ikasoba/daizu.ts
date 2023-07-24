import { ParserType } from "./ParserType.js";
import { TextRange } from "./TextRange.js";
import { choice, createRef, ignore, log, many0, many1, map, parse, regexp, string, tuple, until } from "./parser.js";

const daizuHelper = {
  many0<R, E>(this: ParserType<R, E>) {
    return installHelper(many0(this));
  },
  many1<R, E>(this: ParserType<R, E>) {
    return installHelper(many1(this));
  },
  map<R, E, T>(
    this: ParserType<R, E>,
    fn: (value: R, index: number, range: TextRange) => T
  ) {
    return installHelper(map(this, fn));
  },
  ignore<R, E>(this: ParserType<R, E>) {
    return installHelper(ignore(this));
  },
  parse<R, E>(this: ParserType<R, E>, source: string) {
    return parse(this, source);
  },
  until(this: ParserType<any, any>) {
    return installHelper(until(this));
  },
  log<R, E>(this: ParserType<R, E>, name: string) {
    return installHelper(log(name, this));
  }
};

export const installHelper = (
  _parser: ParserType<any, any>
): ParserType<any, any> & (typeof daizuHelper) => {
  const parser = _parser as any;

  for (const k in daizuHelper) {
    parser[k] = (daizuHelper as any)[k]
  }

  return parser;
};

export default {
  string<S extends string>(str: S) {
    return installHelper(string(str))
  },
  regexp(pattern: string | RegExp) {
    return installHelper(regexp(pattern))
  },
  tuple<T extends ParserType<any, any>[]>(
    ...parsers: T
  ) {
    return installHelper(tuple(...parsers));
  },
  choice<T extends ParserType<any, any>[]>(
    ...parsers: T
  ) {
    return installHelper(choice(...parsers));
  },
  createRef<R, E>() {
    return installHelper(createRef());
  }
};

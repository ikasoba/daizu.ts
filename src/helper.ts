import { ParserType } from "./ParserType.js";
import { TextRange } from "./TextRange.js";
import * as Parser from "./parser.js";

// dtsが大きくなりすぎるため
export interface DaizuHelper {
  many0<R, E>(
    this: ParserType<R, E>,
  ): (ReturnType<typeof Parser.many0<R, E>>) & DaizuHelper;

  many1<R, E>(
    this: ParserType<R, E>,
  ): (ReturnType<typeof Parser.many1<R, E>>) & DaizuHelper;

  map<R, E, T>(
    this: ParserType<R, E>,
    fn: (value: R, index: number, range: TextRange) => T,
  ): (ReturnType<typeof Parser.map<R, E, T>>) & DaizuHelper;

  mapWithLocation<R, E, T>(
    this: ParserType<R, E>,
    fn: (value: R, index: number, range: TextRange) => T,
  ):
    & (ReturnType<typeof Parser.map<R, E, T & { location: TextRange }>>)
    & DaizuHelper;

  ignore<R, E>(
    this: ParserType<R, E>,
  ): (ReturnType<typeof Parser.ignore<E>>) & DaizuHelper;

  parse<R, E>(
    this: ParserType<R, E>,
    source: string,
  ): ReturnType<typeof Parser.parse<R, E>>;

  until(
    this: ParserType<any, any>,
  ): (ReturnType<typeof Parser.until>) & DaizuHelper;

  log<R, E>(
    this: ParserType<R, E>,
    name: string,
  ): (ReturnType<typeof Parser.log<R, E>>) & DaizuHelper;
}

const daizuHelper: DaizuHelper = {
  many0<R, E>(
    this: ParserType<R, E>,
  ) {
    return installHelper(Parser.many0(this));
  },
  many1<R, E>(this: ParserType<R, E>) {
    return installHelper(Parser.many1(this));
  },
  map<R, E, T>(
    this: ParserType<R, E>,
    fn: (value: R, index: number, range: TextRange) => T,
  ) {
    return installHelper(Parser.map(this, fn));
  },
  mapWithLocation<R, E, T>(
    this: ParserType<R, E>,
    fn: (value: R, index: number, range: TextRange) => T,
  ) {
    return installHelper(
      Parser.map<R, E, T & { location: TextRange }>(this, (...a) => {
        const res = fn(...a);

        (res as T & { location: TextRange }).location = a[2];

        return res as any;
      }),
    );
  },
  ignore<R, E>(this: ParserType<R, E>) {
    return installHelper(Parser.ignore(this));
  },
  parse<R, E>(this: ParserType<R, E>, source: string) {
    return Parser.parse(this, source);
  },
  until(this: ParserType<any, any>) {
    return installHelper(Parser.until(this));
  },
  log<R, E>(this: ParserType<R, E>, name: string) {
    return installHelper(Parser.log(name, this));
  },
};

export const installHelper = <P extends ParserType<any, any>>(
  _parser: P,
): P & DaizuHelper => {
  const parser = _parser as any;

  for (const k in daizuHelper) {
    parser[k] = (daizuHelper as any)[k];
  }

  return parser;
};

// dtsが大きくなりすぎるため
export interface HelperDefault {
  string<S extends string>(
    str: S,
  ): ReturnType<typeof Parser.string<S>> & DaizuHelper;
  regexp(
    pattern: string | RegExp,
  ): ReturnType<typeof Parser.regexp> & DaizuHelper;
  tuple<T extends ParserType<any, any>[]>(
    ...parsers: T
  ): ReturnType<typeof Parser.tuple<T>> & DaizuHelper;
  choice<T extends ParserType<any, any>[]>(
    ...parsers: T
  ): ReturnType<typeof Parser.choice<T>> & DaizuHelper;
  createRef<R, E>(): ReturnType<typeof Parser.createRef<R, E>> & DaizuHelper;
}

const _default: HelperDefault = {
  string<S extends string>(
    str: S,
  ) {
    return installHelper(Parser.string(str));
  },
  regexp(
    pattern: string | RegExp,
  ) {
    return installHelper(Parser.regexp(pattern));
  },
  tuple<T extends ParserType<any, any>[]>(
    ...parsers: T
  ) {
    return installHelper(Parser.tuple(...parsers));
  },
  choice<T extends ParserType<any, any>[]>(
    ...parsers: T
  ) {
    return installHelper(Parser.choice(...parsers));
  },
  createRef<R, E>() {
    return installHelper(Parser.createRef());
  },
};

export default _default;

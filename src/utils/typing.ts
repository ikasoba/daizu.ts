export const isNot = <
  T1,
  T2 extends undefined | null | boolean | number | bigint | string | symbol
>(
  x: T1,
  y: T2
): x is Exclude<T1, T2> => !Object.is(x, y);

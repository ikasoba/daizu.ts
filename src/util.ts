type _ExcludeFromTuple<T extends any[], U, R extends any[] = []> =
    T extends [infer _ extends U, ...infer Y]
        ? _ExcludeFromTuple<Y, U, R>
    : T extends [infer X, ...infer Y]
        ? _ExcludeFromTuple<Y, U, [...R, X]>
    : T extends []
        ? R
    : never

export type ExcludeFromTuple<T extends any[], U> =
    _ExcludeFromTuple<T, U>
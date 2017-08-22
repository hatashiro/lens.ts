export type Lens<T, U> = {
    readonly [K in keyof U]: Lens<T, U[K]>;
} & LensInternal<T, U>;

export class LensInternal<T, U> {
    constructor(
        public __get: (from: T) => U,
        public __set: (val: U) => (from: T) => T,
    ) { }

    _<V>(other: Lens<U, V>): Lens<T, V> {
        return lens(
            (x: T) => other.__get(this.__get(x)),
            (x: V) => (o: T) => this.__set(other.__set(x)(this.__get(o)))(o),
        );
    }
}

export const lens = <T, U>(
    __get: (from: T) => U,
    __set: (val: U) => (from: T) => T,
): Lens<T, U> => new Proxy(new LensInternal(__get, __set), {
    get(lens: Lens<T, U>, k: keyof U) {
        return k in lens ? (lens as any)[k] : lens._(key<U>()(k));
    }
}) as Lens<T, U>;

export const id = <T>(): Lens<T, T> => lens(
    x => x,
    x => _ => x,
);

export const key = <T>() => <K extends keyof T>(k: K): Lens<T, T[K]> => lens(
    o => o[k],
    x => o => Object.assign(o, { [k as any]: x }),
);

export const getl = <T, U>(lens: Lens<T, U>) =>
    (target: T): U => lens.__get(target);

export const setl = <T, U>(lens: Lens<T, U>, val: U) =>
    (target: T): T => lens.__set(val)(target);

export const updatel = <T, U>(lens: Lens<T, U>, f: (u: U) => U) =>
    (target: T): T => lens.__set(f(lens.__get(target)))(target);

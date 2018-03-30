export type Unwrap<T> = T extends Array<infer U> ? U : never;

export type ObjectLens<T, U> = { readonly [K in keyof U]: Lens<T, U[K]> };
export interface ArrayLens<T, U> extends Array<Lens<T, Unwrap<U>>> {};

export class LensImpl<T, U> {
  constructor(
    private _get: Getter<T, U>,
    private _set: (value: U) => Setter<T>
  ) {
  }

  public k<K extends keyof U>(key: K): Lens<T, U[K]> {
    return this.compose(keyL(key));
  }

  // implementation: Lens.prototype.i
  public i!: U extends Array<infer E> ? (idx: number) => Lens<T, E> : never;

  public compose<V>(other: Lens<U, V>): Lens<T, V> {
    return createLens(
      t => other._get(this._get(t)),
      v => t => this._set(other._set(v)(this._get(t)))(t)
    );
  }

  public get(): Getter<T, U>;
  public get<V>(f: Getter<U, V>): Getter<T, V>;
  public get() {
    if (arguments.length) {
      const f = arguments[0];
      return (t: T) => f(this._get(t));
    } else {
      return this._get;
    }
  }

  public set(value: U): Setter<T>;
  public set(f: Setter<U>): Setter<T>;
  public set(modifier: U | Setter<U>) {
    if (typeof modifier === 'function') {
      return (t: T) => this._set(modifier(this._get(t)))(t);
    } else {
      return this._set(modifier);
    }
  }
}

export type Lens<T, U> = LensImpl<T, U> & ArrayLens<T, U> & ObjectLens<T, U>;

function proxify<T, U>(impl: LensImpl<T, U>): Lens<T, U> {
  return new Proxy(impl, {
    get(target, prop) {
      if (typeof (target as any)[prop] !== 'undefined') {
        return (target as any)[prop];
      }
      return target.compose(keyL(prop as any));
    }
  }) as any;
}

export function createLens<T, U>(
  _get: Getter<T, U>,
  _set: (value: U) => Setter<T>
): Lens<T, U> {
  return proxify(new LensImpl(_get, _set));
}

export type Getter<T, V> = (target: T) => V;
export type Setter<T>    = (target: T) => T;

LensImpl.prototype.i = function(idx) {
  // implementation is the same as .k()
  return this.compose(keyL(idx as any));
};

function copy<T>(x: T): T {
  if (Array.isArray(x)) {
    return x.slice() as any;
  } else if (x && typeof x === 'object') {
    return Object.keys(x).reduce<any>((res, k) => {
      res[k] = (x as any)[k];
      return res;
    }, {});
  } else {
    return x;
  }
}

function keyL<T, K extends keyof T>(prop: K): Lens<T, T[K]> {
  return createLens(
    t => t[prop],
    v => t => {
      const copied = copy(t);
      copied[prop] = v;
      return copied;
    }
  );
}

export function lens<T>(): Lens<T, T> {
  return createLens(t => t, v => t => v);
}

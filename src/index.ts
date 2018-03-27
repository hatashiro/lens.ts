export class Lens<T, U> {
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
    return new Lens(
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

export type Getter<T, V> = (target: T) => V;
export type Setter<T>    = (target: T) => T;

Lens.prototype.i = function(idx) {
  // implementation is the same as .k()
  return this.compose(keyL(idx as any));
};

function copy<T>(x: T): T {
  if (Array.isArray(x)) {
    return x.map(e => e) as any;
  } else if (x && typeof x === 'object') {
    return Object.keys(x).reduce((res, k) => {
      res[k] = (x as any)[k];
      return res;
    }, {} as any);
  } else {
    return x;
  }
}

function keyL<T, K extends keyof T>(prop: K): Lens<T, T[K]> {
  return new Lens(
    t => t[prop],
    v => t => {
      const copied = copy(t);
      copied[prop] = v;
      return copied;
    }
  );
}

export function lens<T>(): Lens<T, T> {
  return new Lens(t => t, v => t => v);
}

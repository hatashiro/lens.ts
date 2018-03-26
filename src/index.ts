export class Lens<T, U> {
  constructor(
    public get: (target: T) => U,
    public set: (value: U) => (target: T) => T
  ) {
  }

  public k<K extends keyof U>(key: K): Lens<T, U[K]> {
    return this.compose(keyL(key));
  }

  // implementation: Lens.prototype.i
  public i!: U extends Array<infer E> ? (idx: number) => Lens<T, E> : never;

  public compose<V>(other: Lens<U, V>): Lens<T, V> {
    return new Lens(
      t => other.get(this.get(t)),
      v => t => this.set(other.set(v)(this.get(t)))(t)
    );
  }

  public update(f: (u: U) => U): (target: T) => T {
    return t => this.set(f(this.get(t)))(t);
  }

  public view<V>(f: (u: U) => V): (target: T) => V {
    return t => f(this.get(t));
  }
}

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

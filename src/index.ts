export class Lens<T, U> {
  constructor(
    public get: (target: T) => U,
    public set: (value: U) => (target: T) => T
  ) {
  }

  public k<K extends keyof U>(key: K): Lens<T, U[K]> {
    return this.compose(new KeyLens(key));
  }

  public i(idx: number): Lens<T, U extends Array<infer E> ? E : never> {
    return this.compose(new IndexLens(idx) as any);
  }

  public compose<V>(other: Lens<U, V>): Lens<T, V> {
    return new Lens(
      t => other.get(this.get(t)),
      v => t => this.set(other.set(v)(this.get(t)))(t)
    );
  }

  public update(f: (u: U) => U): (target: T) => T {
    return t => this.set(f(this.get(t)))(t);
  }
}

export class KeyLens<T, K extends keyof T> extends Lens<T, T[K]> {
  constructor(key: K) {
    super(
      t => t[key],
      v => t => Object.assign({}, t, { [key]: v })
    );
  }
}

export class IndexLens<E> extends Lens<Array<E>, E> {
  constructor(idx: number) {
    super(
      t => t[idx],
      v => t => t.map((_v, _i) => _i === idx ? v : _v)
    );
  }
}

export function lens<T>(): Lens<T, T> {
  return new Lens(t => t, v => t => v);
}

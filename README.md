# lens.ts [![travis-ci](https://travis-ci.org/utatti/lens.ts.svg?branch=master)](https://travis-ci.org/utatti/lens.ts)

TypeScript Lens implementation

## Lens?

Lens is composable abstraction of getter and setter. For more detail of Lens, I
recommend reading the following documents.

- [**Haskell `lens` package**](https://hackage.haskell.org/package/lens)
- [**A Little Lens Starter Tutorial**](https://www.schoolofhaskell.com/school/to-infinity-and-beyond/pick-of-the-week/a-little-lens-starter-tutorial) of *School of Haskell*

## Install

Via [npm](https://www.npmjs.com/package/lens.ts):

``` shell
npm i lens.ts
```

## Usage

``` typescript
// import a factory function for lens
import { lens } from 'lens.ts';

type Person = {
  name: string;
  age: number;
  accounts: Array<Account>;
};

type Account = {
  type: string;
  handle: string;
};

const azusa: Person = {
  name: 'Nakano Azusa',
  age: 15,
  accounts: [
    {
      type: 'twitter',
      handle: '@azusa'
    },
    {
      type: 'facebook',
      handle: 'nakano.azusa'
    }
  ]
};

// create an identity lens for Person
const personL = lens<Person>();

// type-safe key lens with k()
personL.k('name') // :: Lens<Person, string>
personL.k('accounts') // :: Lens<Person, Array<Account>>
personL.k('hoge') // type error, 'hoge' is not a key of Person

// type-safe index lens with i()
personL.k('accounts').i(1) // :: Lens<Person, Account>
personL.i(1) // type error, 'i' cannot be used for non-array type

// type-safe lens composition
lens<Person>().k('accounts').i(1).compose(
  lens<Account>().k('handle')
);

// get, set and update with lens
personL.k('accounts').i(0).k('handle').get(azusa) // -> '@azusa'
personL.k('name').set('中野梓')(azusa) // -> { name: '中野梓', ... }
personL.k('age').update(x => x + 1)(azusa) // -> { age: 16, ... }
```

You can find similar example code in [test/test.ts](test/test.ts)

## API

`lens.ts` exports the followings:

``` typescript
import { lens, Lens } from 'lens.ts';
```

### `lens`

A function `lens` is a factory function for an identity lens for a type. It
returns a `Lens` instance.

``` typescript
lens<Person>() // :: Lens<Person, Person>
```

### `Lens<T, U>`

An instance of `Lens` can be constructed with a getter and setter for a
source type `T` and a result type `U`.

Usually, you don't need to import `Lens` directly.

``` typescript
class Lens<T, U> {
  constructor(
    public get: (target: T) => U,
    public set: (value: U) => (target: T) => T
  ) { ... }
}
```

`Lens` provides the following methods.

#### `.get(src: T): U`

Retrive an actual value from an actual source.

``` typescript
let x: T;
let lens: Lens<T, U>;

lens.get(x) // :: U
```

#### `.set(val: U): (src: T) => T`

Returns a setter function returning a new object with the provided value already
set. This function is immutable.

``` typescript
let x: T;
let lens: Lens<T, string>;

let y: T = lens.set('hello')(x);

lens.get(y) // -> 'hello'
```

#### `.update(f: (val: U) => U): (src: T) => T`

Same as `.set()`, but with a modifier instead of a value.

``` typescript
let y: T;
let lens: Lens<T, string>;

let z: T = lens.update(str => str + ', world')(y);

lens.get(z) // -> 'hello, world'
```

#### `.compose(otherLens: Lens<U, V>): Lens<U, V>`

Compose 2 lenses into one.

``` typescript
let lens1: Lens<T, U>;
let lens2: Lens<U, V>;

lens1.compose(lens2) // :: Lens<T, V>
```

#### `.k(key: string)`

Narrow the lens for a property of `U`.

``` typescript
type Person = { name: string };

let lens: Lens<Person, Person>;

lens.k('name') // :: Lens<Person, string>
```

#### `.i(index: number)`

Narrow the lens for an element of an array `U`. A type error is thrown if `U` is
not an array.

``` typescript
let lens: Lens<T, Array<E>>;

lens.i(10) // :: Lens<T, E>
```

## License

[MIT](LICENSE)

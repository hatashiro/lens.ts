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

// get and set with lens
personL.k('accounts').i(0).k('handle').get()(azusa) // -> '@azusa'
personL.k('name').set('中野梓')(azusa) // -> { name: '中野梓', ... }
personL.k('age').set(x => x + 1)(azusa) // -> { age: 16, ... }
```

You can find similar example code in [test/test.ts](test/test.ts)

## API

`lens.ts` exports the followings:

``` typescript
import {
  lens,
  Getter,
  Setter,
  Lens
} from 'lens.ts';
```

### `lens`

A function `lens` is a factory function for an identity lens for a type. It
returns a `Lens` instance.

``` typescript
lens<Person>() // :: Lens<Person, Person>
```

### `Getter`, `Setter`

They are just a type alias for the following function types.

``` typescript
export type Getter<T, V> = (target: T) => V;
export type Setter<T>    = (target: T) => T;
```

Basically, `Getter` is a function to retrieve a value from a target. `Setter` is
a function to set or update a value in a provided target and return a new object
with a same type as the target.

Any `Setter` returned from `Lens` has immutable API, which means it doesn't
modify the target object.

### `Lens<T, U>`

An instance of `Lens` can be constructed with a getter and setter for a
source type `T` and a result type `U`.

Usually, you don't need to import `Lens` directly.

``` typescript
class Lens<T, U> {
  constructor(
    private _get: (target: T) => U,
    private _set: (value: U) => (target: T) => T
  ) { ... }
}
```

`Lens` provides the following methods.

#### `.k(key: string)`

Narrow the lens for a property of `U`.

``` typescript
// we will use these types for the following examples
type Person = {
  name: string;
  age: number;
  accounts: Account[];
};

lens<Person>.k('name') // :: Lens<Person, string>
```

#### `.i(index: number)`

Narrow the lens for an element of an array `U`. A type error is thrown if `U` is
not an array.

``` typescript
lens<Person>.k(accounts).i(1) // :: Lens<Person, Account>
```


#### `.get()`

It is polymorphic.

- `.get(): Getter<T, U>`
- `.get<V>(f: Getter<U, V>): Getter<T, V>`

`.get()` returns a getter, which can be applied to an actual target object to
retrive an actual value. You can optionally provide another getter (or mapping
function) to retrieve a mapped value.

``` typescript
const target = { age: 15, ... };

const ageL = lens<Person>().k('age');

ageL.get()(target) // -> 15
ageL.get(age => age + 10)(target) // -> 25
```

#### `.set()`

It is polymorphic.

- `.set(val: U): Setter<T>`
- `.set(f: Setter<U>): Setter<T>`

`.set()` returns a setter, which can set or update an internal value and returns
an updated (and new) object. `Setter`s here should be all immutable. You can
provide a value to set, or optionally a setter for value.

``` typescript
const target = { age: 15, ... };

const ageL = lens<Person>().k('age');

ageL.set(20)(target) // -> { age: 20, ... }
ageL.set(age => age + 1)(target) // -> { age: 16, ... }
```

#### `.compose(another: Lens<U, V>): Lens<U, V>`

Compose 2 lenses into one.

``` typescript
let lens1: Lens<T, U>;
let lens2: Lens<U, V>;

let accountsL = lens<Person>().k('accounts');
let firstL = <T>() => lens<T[]>().i(0);

let firstAccountL =
  accountsL.compose(firstL()); // :: Lens<Person, Account>
```

*FYI: The reason `firstL` becomes a function with `<T>` is to make it
polymorphic.*

## License

[MIT](LICENSE)

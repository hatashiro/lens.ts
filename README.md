# lens.ts [![travis-ci](https://travis-ci.org/utatti/lens.ts.svg?branch=master)](https://travis-ci.org/utatti/lens.ts)

TypeScript Lens implementation with property proxy

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

// key lens with k()
personL.k('name') // :: Lens<Person, string>
personL.k('accounts') // :: Lens<Person, Array<Account>>
personL.k('hoge') // type error, 'hoge' is not a key of Person

// index lens with i()
personL.k('accounts').i(1) // :: Lens<Person, Account>
personL.i(1) // type error, 'i' cannot be used for non-array type

// You can use property proxy to narrow lenses
personL.name // :: Lens<Person, string>
personL.accounts // :: Lens<Person, Array<Account>>
personL.accounts[1] // :: Lens<Person, Account>
personL.hoge // type error

// get and set with Lens
personL.accounts[0].handle.get()(azusa) // -> '@azusa'
personL.accounts[0].handle.set('@nakano')(azusa) // -> { ... { handle: '@nakano' } ... }
personL.age.set(x => x + 1)(azusa) // -> { age: 16, ... }

// Lens composition
const fstAccountL = lens<Person>().accounts[0] // :: Lens<Person, Account>
const handleL = lens<Account>().handle // :: Lens<Account, string>
fstAccountL.compose(handleL) // :: Lens<Person, string>

// Getter/Setter composition
fstAccountL.get(handleL.get())(azusa) // -> '@azusa'
fstAccountL.set(handleL.set('@nakano'))(azusa) // -> { ... { handle: '@nakano' } ... }
```

You can find similar example code in [/test](test).

## API

`lens.ts` exports the followings:

``` typescript
import {
  lens,
  Getter,
  Setter,
  Lens,
  createLens
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

`Lens` is not just a class, but it's internally a product type of `LensImpl` and
Proxy types, so you cannot just create one with `new Lens()`. A recommended way
to create an instance is `lens<X>()`, but you can also manually provide a getter
and a setter with `createLens()`.

``` typescript
function createLens<T, U>(
  _get: Getter<T, U>,
  _set: (value: U) => Setter<T>
): Lens<T, U> {
  return proxify(new LensImpl(_get, _set));
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

#### Proxied properties

`Lens<T, U>` also provides proxied properties for the type `U`. It's simpler
alternative for `.k()` or `.i()`.

``` typescript
objL.name // same as objL.k('name')
arrL[0] // same as arrL.i(0)
```

## Credits

Property proxy couldn't have been implemented without
[@ktsn](https://github.com/ktsn)'s help.

- https://github.com/ktsn/lens-proxy

## License

[MIT](LICENSE)

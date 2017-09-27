# lens.ts [![travis-ci](https://travis-ci.org/utatti/lens.ts.svg?branch=master)](https://travis-ci.org/utatti/lens.ts)

TypeScript Lens implementation with object property proxy

## Lens?

Lens is composable abstraction of getter and setter. For more detail of Lens, I
recommend reading the following documents.

- [**Haskell `lens` package**](https://hackage.haskell.org/package/lens)
- [**A Little Lens Starter Tutorial**](https://www.schoolofhaskell.com/school/to-infinity-and-beyond/pick-of-the-week/a-little-lens-starter-tutorial) of *School of Haskell*

## Install

Via [npm](https://www.npmjs.com/package/lens.ts):

``` bash
$ npm i lens.ts
```

## Usage

``` typescript
type Person = {
    name: string,
    age: number,
    accounts: Accounts,
};

type Accounts = {
    twitter?: string,
    facebook?: string,
};

const azusa: Person = {
    name: 'Nakano Azusa',
    age: 15,
    accounts: {
        twitter: '@azusa',
    },
};

// create a identity lens for Person
const personL = id<Person>();

// it automatically generates property lenses via Proxy
personL.name; // :: Lens<Person, string>
personL.accounts; // :: Lens<Person, Accounts>
personL.accounts.twitter; // :: Lens<Person, string>

// a key lens can be created manually
key<Person>()('name'); // the same as personL.name

// lenses can be composed via `._()`
key<Person>()('accounts')._(key<Accounts>()('twitter'));

// get, set and update with lens
getl(personL.accounts.twitter)(azusa); // -> '@azusa'

setl(
    personL.name,
    '中野梓',
)(azusa); // -> { name: '中野梓', ... }

updatel(
    personL.age,
    x => x + 1,
)(azusa); // -> { age: 16, ... }
```

You can find the same code in [test/test.ts](test/test.ts)

## API

`lens.ts` exports the followings:

``` typescript
import {
    Lens,
    LensInternal,
    lens,
    id,
    key,
    getl,
    setl,
    updatel,
} from 'lens.ts';
```

### `Lens`

The type `Lens` is just `LensInternal` + property proxy.

``` typescript
type Lens<T, U> = {
    readonly [K in keyof U]: Lens<T, U[K]>;
} & LensInternal<T, U>;
```

Example:

``` typescript
let lens1: Lens<T, U>;
lens.prop1; // .prop1 is also a lens from T to prop1 of U
```

### `LensInternal`

`LensInternal` provides the compose function `_()` for two lenses.

``` typescript
class LensInternal<T, U> {
    _<V>(other: Lens<U, V>): Lens<T, V>;
}
```

Example:

``` typescript
let lens1: Lens<T, U>;
let lens2: Lens<U, V>;

lens1._(lens2); // :: Lens<T, V>
```

### `lens`

Create a lens with a getter and a setter.

``` typescript
function lens<T, U>(
    get: (from: T) => U,
    set: (val: U) => (from: T) => T,
): Lens<T, U>;
```

### `id`

Create an identity lens with an object type.

``` typescript
function id<T>(): Lens<T, T>;
```

Example:

``` typescript
let personL = id<Person>();
```

### `key`

Create a key lens for an object.

``` typescript
function key<T>(): <K extends keyof T>(k: K): Lens<T, T[K]>;
```

Example:

``` typescript
let personNameL = key<Person>()('name');
```

### `getl`

`getl` is for *get lens*. It retrives a value from a lens with a target object.

``` typescript
function getl<T, U>(lens: Lens<T, U>): (target: T) => U;
```

Example:

``` typescript
let p: Person = { name: 'Azusa' };
getl(personNameL)(p); // -> 'Azusa'
```

### `setl`

`setl` is for *set lens*. It sets a value of a lens with a target object.

``` typescript
function setl<T, U>(lens: Lens<T, U>, val: U): (target: T) => T
```

Example:

``` typescript
setl(personNameL, 'Yui')(p); // -> { name: 'Yui' }
```

### `updatel`

`updatel` is for *update lens*. It updates a value of a lens by a function, with a target object.

``` typescript
function updatel<T, U>(lens: Lens<T, U>, f: (val: U) => U): (target: T) => T
```

Example:

``` typescript
updatel(personNameL, name => 'Hirasawa ' + name)(p); // -> { name: Hirasawa Yui }
```

## License

[MIT](LICENSE)

import {
    id,
    key,
} from '../../src/';

type Person = {
    name: string,
    age: number,
    accounts: Accounts,
};

type Accounts = {
    twitter?: string,
    facebook?: string,
};

id<Person>()._(key<Person>()('foo'));

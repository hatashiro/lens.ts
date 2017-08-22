import {
    id,
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

id<Person>().foo;

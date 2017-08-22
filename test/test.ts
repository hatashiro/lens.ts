import { equal, deepEqual } from 'assert';
import {
    id,
    key,
    getl,
    setl,
    updatel,
} from '../src/';

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

// id lens test
const personL = id<Person>();
deepEqual(getl(personL)(azusa), azusa);

// key lens test with composition
equal(
    getl(
        personL._(key<Person>()('name'))
    )(azusa),
    'Nakano Azusa',
);

// property lens test
const twitterL = personL.accounts.twitter;
equal(getl(twitterL)(azusa), '@azusa');

// property lens test with composition
equal(
    getl(
        personL.accounts._(key<Accounts>()('twitter'))
    )(azusa),
    '@azusa',
);

// setl test
setl(personL.accounts.facebook, '中野梓')(azusa);
equal(getl(personL.accounts.facebook)(azusa), '中野梓');

// updatel test
updatel(personL.name, name => {
    const [sur, given] = name.split(' ');
    return `${given} ${sur}`;
})(azusa);
equal(getl(personL.name)(azusa), 'Azusa Nakano');

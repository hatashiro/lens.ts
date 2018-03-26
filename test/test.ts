import { equal, deepEqual } from 'assert';
import { lens } from '../src/';

type Person = {
  name: string,
  age: number,
  accounts: Array<Account>
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

const personL = lens<Person>();
deepEqual(personL.get(azusa), azusa);

equal(
  personL.compose(lens<Person>().k('name')).get(azusa),
  'Nakano Azusa'
);

const twitterL = personL.k('accounts').i(0).k('handle');
equal(twitterL.get(azusa), '@azusa');

// property lens test with composition
equal(
  personL.k('accounts').compose(lens<Account[]>().i(1)).k('handle').get(azusa),
  'nakano.azusa'
);

// set test
const nthHandle = (n: number) => personL.k('accounts').i(n).k('handle');
const azusa_ = nthHandle(1).set('中野梓')(azusa);
equal(nthHandle(1).get(azusa), 'nakano.azusa');
equal(nthHandle(1).get(azusa_), '中野梓');

// update test
const azusa__ = personL.k('name').update(name => {
  const [sur, given] = name.split(' ');
  return `${given} ${sur}`;
})(azusa);
equal(personL.k('name').get(azusa), 'Nakano Azusa');
equal(personL.k('name').get(azusa__), 'Azusa Nakano');

const azusa___ = personL.k('accounts').update(xs => xs.concat([{
  type: 'instagram',
  handle: 'nakano.azusa',
}]))(azusa);
equal(personL.k('accounts').k('length').get(azusa), 2);
equal(personL.k('accounts').k('length').get(azusa___), 3);

// view test
const accountTypes = personL.k('accounts').view(xs => xs.map(x => x.type));
deepEqual(accountTypes(azusa___), ['twitter', 'facebook', 'instagram']);

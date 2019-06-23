import { equal, deepEqual } from 'assert';
import { lens, prism } from '../src/';

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
const getPerson = personL.get();
deepEqual(getPerson(azusa), azusa);

equal(
  personL.compose(personL.name).get()(azusa),
  'Nakano Azusa'
);

const twitterL = personL.accounts[0].handle;
const getTwitterHandle = twitterL.get();
equal(getTwitterHandle(azusa), '@azusa');

// property lens test with composition
equal(
  personL.accounts.compose(lens<Account[]>()[1].handle).get()(azusa),
  'nakano.azusa'
);

// set with value
const nthHandle = (n: number) => personL.accounts[n].handle;
const get1stHandle = nthHandle(1).get();
const set1stHandle = nthHandle(1).set('中野梓');
equal(get1stHandle(set1stHandle(azusa)), '中野梓');
equal(get1stHandle(azusa), 'nakano.azusa'); // immutablility test

// set with modify function
const reverseName = personL.name.set(name => {
  const [sur, given] = name.split(' ');
  return `${given} ${sur}`;
});
equal(reverseName(azusa).name, 'Azusa Nakano');
equal(azusa.name, 'Nakano Azusa'); // immutablility test

const azusa___ = personL.accounts.set(xs => xs.concat([{
  type: 'instagram',
  handle: 'nakano.azusa',
}]))(azusa);
equal(personL.accounts.length.get()(azusa), 2);
equal(personL.accounts.length.get()(azusa___), 3);

// get with map function
const accountTypes = personL.accounts.get(xs => xs.map(x => x.type));
deepEqual(accountTypes(azusa___), ['twitter', 'facebook', 'instagram']);

// getter/setter composition
const firstAccountL = lens<Person>().accounts[0];
const accountHandleL = lens<Account>().handle;
const setter = firstAccountL.set(accountHandleL.set('yui'));
const getter = firstAccountL.get(accountHandleL.get());
equal(getter(setter(azusa)), 'yui');


type Customer = {
  name: string,
  age: number,
  account?: Account | null | undefined
};

const customerA: Customer = {
  name: 'Nakano Azusa',
  age: 15,
  account: undefined
};

const customerB: Customer = {
  name: 'John Doe',
  age: 61,
  account: {
    type: 'twitter',
    handle: '@johndoe'
  }
};

const customerC: Customer = {
  name: 'Nakano Azusa',
  age: 15,
};

const customerPrism = prism<Customer>().account.handle;
equal(customerPrism.get()(customerA), undefined);
equal(customerPrism.get()(customerB), '@johndoe');
equal(customerPrism.get()(customerC), undefined);

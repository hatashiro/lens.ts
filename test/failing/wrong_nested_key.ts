import { lens } from '../../src/';

type Person = {
  name: string,
  age: number,
  accounts: Array<Account>
};

type Account = {
  type: string;
  handle: string;
};

lens<Person>().k('accounts').i(0).compose(lens<Account>().k('foo'));

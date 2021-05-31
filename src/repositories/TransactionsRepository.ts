import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO

    const transactions = await this.find();
    const types: Record<string, number> = transactions.reduce(
      (accumulator, transaction) => {
        const { type } = transaction;

        if (type === 'income') {
          accumulator.income += +transaction.value;
        } else {
          accumulator.outcome += +transaction.value;
        }
        return accumulator;
      },
      { income: 0, outcome: 0 },
    );
    const ballance: Balance = {
      income: types.income,
      outcome: types.outcome,
      total: types.income - types.outcome,
    };

    return ballance;
  }
}

export default TransactionsRepository;

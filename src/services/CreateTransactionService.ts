import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CategoryRepository from '../repositories/CategoryRepository';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionRepository = getRepository(Transaction);
    const transactionCustomRepository = getCustomRepository(
      TransactionRepository,
    );
    const categoryRepository = getRepository(Category);

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category,
    });

    if (
      type === 'outcome' &&
      (await transactionCustomRepository.getBalance()).total < value
    ) {
      throw new AppError('Insuficient money', 400);
    }
    const categoryCustomRepository = getCustomRepository(CategoryRepository);

    const findCategory = await categoryCustomRepository.findByTitle(category);

    if (!findCategory) {
      try {
        const newCategory = categoryRepository.create({ title: category });
        await categoryRepository.save(newCategory);
        transaction.category_id = newCategory.id;
        // console.log('new category has created');
      } catch {
        throw new AppError('Error Categotegory', 500);
      }
    } else {
      const { id } = findCategory;
      transaction.category_id = id;
    }

    await transactionRepository.save(transaction);
    // console.log('new transaction created');
    return transaction;
  }
}

export default CreateTransactionService;

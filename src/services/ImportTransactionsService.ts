import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In, getCustomRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

class ImportTransactionsService {
  async execute(csvFilePath: string): Promise<Transaction[]> {
    // TODO

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 1,
      ltrim: true,
      rtrim: true,
      columns: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);
    const csvLines: Transaction[] = [];

    parseCSV.on('data', line => {
      csvLines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const importedTransactions: Transaction[] = [];
    const transactionCustomRepository = getCustomRepository(
      TransactionRepository,
    );
    const CategoryRepository = getRepository(Category);

    const distinctCategoriesTitles = csvLines
      .map(item => item.category)
      .filter((value, index, self) => self.indexOf(value) === index);

    const distinctCategories: Category[] = distinctCategoriesTitles.map(
      category => CategoryRepository.create({ title: category }),
    );

    const existCategories = await CategoryRepository.find({
      where: {
        title: In(distinctCategories),
      },
    });

    let newCategories: Category[] = distinctCategories.filter(
      category => !existCategories.includes(category),
    );

    if (!newCategories) {
      newCategories = distinctCategories;
    }

    await CategoryRepository.save(newCategories);

    csvLines.forEach(async transaction => {
      // if (
      //   transaction.type === 'outcome' &&
      //   (await transactionCustomRepository.getBalance()).total <
      //     transaction.value
      // ) {
      //   // throw new AppError('Insuficient money', 400);
      // }

      try {
        const catId = newCategories.find(
          category => transaction.category === category.title,
        );

        const editedTransaction = transaction;
        if (catId) editedTransaction.category_id = catId.id;

        importedTransactions.push(editedTransaction);

        //  console.log(editedTransaction);
      } catch (err) {
        console.log(err);
      }
    });
    await transactionCustomRepository.insert(importedTransactions);

    return importedTransactions;
  }
}

export default ImportTransactionsService;

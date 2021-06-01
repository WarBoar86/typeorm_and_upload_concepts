import { Router } from 'express';

import { getCustomRepository } from 'typeorm';
import path from 'path';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import Transaction from '../models/Transaction';

import multer = require('multer');

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '..', '..', 'tmp'),
  filename(request, file, callback) {
    const filename = file.originalname;
    return callback(null, filename);
  },
});

const upload = multer({ storage });

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  // TODO
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  // TODO
  const createTransactionService = new CreateTransactionService();
  const { title, type, value, category } = request.body;
  const transaction = { title, type, value, category };

  const newTransaction = await createTransactionService.execute(transaction);

  return response.json(newTransaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const { id } = request.params;

  transactionRepository.delete({ id });
  return response.status(204).json({});
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO
    const importService = new ImportTransactionsService();

    const directory = path.resolve(
      __dirname,
      '..',
      '..',
      'tmp',
      'import_template.csv',
    );

    const newImportedTransactions = await importService.execute(directory);

    return response.json(newImportedTransactions);
  },
);

export default transactionsRouter;

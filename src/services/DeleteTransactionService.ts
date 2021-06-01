import { getCustomRepository } from 'typeorm';
import { Request } from 'express';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(request: Request): Promise<void> {
    // TODO
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const { id } = request.params;

    const transactionID = await transactionRepository.findOne(id);

    if (transactionID) {
      transactionRepository.delete({ id });
    } else {
      throw new AppError('ID not found', 400);
    }
  }
}

export default DeleteTransactionService;

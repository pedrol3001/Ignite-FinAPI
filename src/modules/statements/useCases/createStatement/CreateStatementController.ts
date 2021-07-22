import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { AppError } from '../../../../shared/errors/AppError';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const receiver_id = request.params.user_id;
    const { amount, description } = request.body;

    const splittedPath = request.originalUrl.split('/')

    var type : OperationType | undefined = undefined;

    splittedPath.forEach((path)=>{
      if (Object.values(OperationType).includes(path as OperationType)) {

        type = path as OperationType;
      }
    });

    if(!type){
      throw new AppError("Invalid statement type");
    }

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id: (type === 'transfer' ? receiver_id : user_id),
      sender_id: (type === 'transfer' ? user_id : null) ,
      type,
      amount,
      description
    });

    return response.status(201).json(statement);
  }
}

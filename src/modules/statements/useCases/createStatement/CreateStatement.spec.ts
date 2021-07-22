import { resourceLimits } from "node:worker_threads";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";


enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

let createStatement_useCase: CreateStatementUseCase;
let createUser_useCase: CreateUserUseCase;
let statement_repository: InMemoryStatementsRepository;
let user_repository: InMemoryUsersRepository;
describe("Create statement",()=>{
  beforeEach(()=>{
    user_repository = new InMemoryUsersRepository();
    statement_repository = new InMemoryStatementsRepository();
    createUser_useCase = new CreateUserUseCase(user_repository);
    createStatement_useCase = new CreateStatementUseCase(user_repository,statement_repository);
  });

  it("should be able to create a statement",async ()=>{

    const user:ICreateUserDTO = {
      name: "teste",
      email: "teste@teste.com",
      password: "pass_teste"
    }

    const userFromDb = await createUser_useCase.execute(user);

    const user_id = userFromDb?.id || "";

    const statement :ICreateStatementDTO = {
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "teste",
      sender_id: user_id,
      user_id: user_id
    }

    const statementFromDb = await createStatement_useCase.execute(statement);

    const statement_id = statementFromDb?.id || "";

    const result = await statement_repository.findStatementOperation({statement_id, user_id});
    expect(result).toHaveProperty("description");


  });

  it("should not be able to create a stetement of invalid user",()=>{
    expect(async ()=>{

      const statement :ICreateStatementDTO = {
        amount: 100,
        type: OperationType.DEPOSIT,
        description: "teste",
        user_id: "Não é user id",
        sender_id: null,
      }

      await createStatement_useCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);

  });

  it("should not be able to create a negative balance statement",()=>{
    expect(async ()=>{

      const user1:ICreateUserDTO = {
        name: "teste",
        email: "teste@teste.com",
        password: "pass_teste"
      }

      const user2:ICreateUserDTO = {
        name: "testee",
        email: "testee@testee.com",
        password: "pass_teste"
      }

      await createUser_useCase.execute(user1);
      await createUser_useCase.execute(user2);


      const user1FromDb = await user_repository.findByEmail(user1.email);
      const user2FromDb = await user_repository.findByEmail(user2.email);

      const user1_id = user1FromDb?.id || "";

      const user2_id = user2FromDb?.id || "";

      const statement1 :ICreateStatementDTO = {
        amount: 100,
        type: OperationType.WITHDRAW,
        description: "teste",
        user_id: user1_id,
        sender_id: null
      }

      await createStatement_useCase.execute(statement1);

      const statement2 :ICreateStatementDTO = {
        amount: 100,
        type: OperationType.TRANSFER,
        description: "teste",
        user_id: user1_id,
        sender_id: user2_id
      }

      await createStatement_useCase.execute(statement2);

    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);

  });
});

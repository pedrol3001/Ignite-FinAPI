import { resourceLimits } from "node:worker_threads";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";



enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

let getStatementOperation_useCase: GetStatementOperationUseCase;

let createStatement_useCase: CreateStatementUseCase;
let createUser_useCase: CreateUserUseCase;
let statement_repository: InMemoryStatementsRepository;
let user_repository: InMemoryUsersRepository;
describe("Get statement operaion",()=>{
  beforeEach(()=>{
    user_repository = new InMemoryUsersRepository();
    statement_repository = new InMemoryStatementsRepository();
    createUser_useCase = new CreateUserUseCase(user_repository);
    createStatement_useCase = new CreateStatementUseCase(user_repository,statement_repository);

    getStatementOperation_useCase = new GetStatementOperationUseCase(user_repository,statement_repository);
  });

  it("should be able to get a statement operation",async ()=>{

    const user1:ICreateUserDTO = {
      name: "teste",
      email: "teste@teste.com",
      password: "pass_teste"
    }

    const user2:ICreateUserDTO = {
      name: "testee",
      email: "testee@testee.com",
      password: "pass_testee"
    }

    const user1FromDb = await createUser_useCase.execute(user1);

    const user2FromDb = await createUser_useCase.execute(user2);

    const user1_id = user1FromDb?.id || "";

    const user2_id = user2FromDb?.id || "";

    const statement1 :ICreateStatementDTO = {
      amount: 200,
      type: OperationType.DEPOSIT,
      description: "teste",
      user_id: user1_id,
      sender_id: user2_id
    }

    const statement2 :ICreateStatementDTO = {
      amount: 100,
      type: OperationType.TRANSFER,
      description: "teste",
      user_id: user1_id,
      sender_id: user2_id
    }

    const statement1FromDb = await createStatement_useCase.execute(statement1);

    const statement2FromDb = await createStatement_useCase.execute(statement2);

    const statement1_id = statement1FromDb?.id || "";

    const statement2_id = statement2FromDb?.id || "";

    const result1 = await getStatementOperation_useCase.execute({statement_id: statement1_id, user_id:user1_id});

    const result2 = await getStatementOperation_useCase.execute({statement_id: statement2_id, user_id:user1_id});

    expect(result1).toHaveProperty("description");

    expect(result2).toHaveProperty("sender_id")

    expect(result2.sender_id).toBe(user2_id);

  });

  it("should not be able to get a stetement operation of invalid user",()=>{
    expect(async ()=>{

      const statement :ICreateStatementDTO = {
        amount: 100,
        type: OperationType.DEPOSIT,
        description: "teste",
        user_id: "Não é user id",
        sender_id: null
      }

      const statementFromDb = await createStatement_useCase.execute(statement);

      const statement_id = statementFromDb?.id || "";

      await getStatementOperation_useCase.execute({statement_id , user_id:"Não é user id"});

    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);

  });

  it("should not be able to get a stetement operation of invalid statement",()=>{
    expect(async ()=>{


      const user:ICreateUserDTO = {
        name: "teste",
        email: "teste@teste.com",
        password: "pass_teste"
      }

      const userFromDb = await createUser_useCase.execute(user);

      const user_id = userFromDb?.id || "";

      await getStatementOperation_useCase.execute({statement_id:"Não é user id" , user_id});

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);

  });
});

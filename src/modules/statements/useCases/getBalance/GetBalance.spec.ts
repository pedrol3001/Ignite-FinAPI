import { resourceLimits } from "node:worker_threads";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}
let getBalance_UseCase: GetBalanceUseCase;

let createStatement_useCase: CreateStatementUseCase;
let createUser_useCase: CreateUserUseCase;
let statement_repository: InMemoryStatementsRepository;
let user_repository: InMemoryUsersRepository;
describe("Get balance",()=>{
  beforeEach(()=>{
    user_repository = new InMemoryUsersRepository();
    statement_repository = new InMemoryStatementsRepository();
    createUser_useCase = new CreateUserUseCase(user_repository);
    createStatement_useCase = new CreateStatementUseCase(user_repository,statement_repository);

    getBalance_UseCase = new GetBalanceUseCase(statement_repository, user_repository);
  });

  it("should be able to get the balance of a user",async ()=>{

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
      user_id: user_id
    }

    const statementFromDb = await createStatement_useCase.execute(statement);

    const result = await getBalance_UseCase.execute({user_id});

    expect(result.balance).toBe(100);


  });

  it("should be able to get the balance of a invalid user",async ()=>{

    expect(async ()=>{
      await getBalance_UseCase.execute({user_id: "Não é user id"});
    }).rejects.toBeInstanceOf(GetBalanceError);

  });
});

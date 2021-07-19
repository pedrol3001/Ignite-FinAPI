import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import {CreateUserUseCase} from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let useCase: CreateUserUseCase;
let repository: InMemoryUsersRepository;
describe("Create user",()=>{
  beforeEach(()=>{
    repository = new InMemoryUsersRepository();
    useCase = new CreateUserUseCase(repository);
  });

  it("should be able to create a user",async ()=>{

    const user:ICreateUserDTO = {
      name: "teste",
      email: "teste@teste.com",
      password: "pass_teste"
    }

    await useCase.execute(user);
    const result = await repository.findByEmail(user.email);

    expect(result).toHaveProperty("password");

  });

  it("should not be able to create a user with the same email",()=>{
    expect(async ()=>{

      const user:ICreateUserDTO = {
        name: "teste",
        email: "teste@teste.com",
        password: "pass_teste"
      }

      await useCase.execute(user);

      await useCase.execute(user);

    }).rejects.toBeInstanceOf(CreateUserError);

  });
});

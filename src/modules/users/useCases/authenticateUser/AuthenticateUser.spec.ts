import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


let useCase: AuthenticateUserUseCase;
let repository: InMemoryUsersRepository;
let createUser: CreateUserUseCase;

describe("Authenticate user",()=>{
  beforeEach(()=>{
    repository = new InMemoryUsersRepository();
    useCase = new AuthenticateUserUseCase(repository);

    createUser = new CreateUserUseCase(repository);
  });

  it("should be able to authenticate a user",async ()=>{


    const user:ICreateUserDTO = {
      name: "teste",
      email: "teste@teste.com",
      password: "pass_teste"
    }

    await createUser.execute(user);

    const result = await useCase.execute({
      email: user.email,
      password: user.password
    });


    expect(result).toHaveProperty("token");

  });

  it("should not authenticate a non existing user",()=>{

    expect(async ()=>{
      const user:ICreateUserDTO = {
        name: "teste",
        email: "teste@teste.com",
        password: "pass_teste"
      }

      await useCase.execute({
        email: user.email,
        password: user.password
      });

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

  });


});

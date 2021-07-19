import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let useCase: ShowUserProfileUseCase;
let repository: InMemoryUsersRepository;
let createUser: CreateUserUseCase;

describe("Show user profile",()=>{
  beforeEach(()=>{
    repository = new InMemoryUsersRepository();
    useCase = new ShowUserProfileUseCase(repository);

    createUser = new CreateUserUseCase(repository);;
  });

  it("should be able to show a user profile",async ()=>{

    const user:ICreateUserDTO = {
      name: "teste",
      email: "teste@teste.com",
      password: "pass_teste"
    }

    const user_from_db = await createUser.execute(user);

    const user_id = user_from_db?.id || '';

    const result = await useCase.execute(user_id);

    expect(result).toHaveProperty("id");

  });

  it("should not be able to show a non existing user ",()=>{
    expect(async ()=>{

      await useCase.execute("Não é um id");

    }).rejects.toBeInstanceOf(ShowUserProfileError);

  });
});

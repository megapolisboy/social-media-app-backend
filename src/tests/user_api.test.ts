import mongoose from "mongoose";
import supertest from "supertest";
import app from "../index";
import { initializeMongoServer } from "../mongoConfigTesting";

const api = supertest(app);

const signinUser = {
  email: "user@example.com",
  password: "1234",
};

const signupUser = {
  email: "user@example.com",
  password: "1234",
  confirmPassword: "1234",
  firstName: "John",
  lastName: "Smith",
};

const signupUserError = {
  email: "user@example.com",
  password: "1234",
  confirmPassword: "124",
  firstName: "John",
  lastName: "Smith",
};

const signInUserWithWrongPassword = {
  email: "user@example.com",
  password: "124",
};

describe("user sign up and sign in tests", () => {
  beforeAll(async () => {
    await initializeMongoServer();
  });

  test("error if not signed up", async () => {
    await api
      .post("/user/signin")
      .send(signinUser)
      .expect(404)
      .expect("Content-Type", /application\/json/);
  });

  test("signup error if passwords are not equal", async () => {
    await api
      .post("/user/signup")
      .send(signupUserError)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("successful sign up with good data", async () => {
    await api
      .post("/user/signup")
      .send(signupUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("sign in fails if password is incorrect", async () => {
    await api.post("/user/signup").send(signupUser);
    await api
      .post("/user/signin")
      .send(signInUserWithWrongPassword)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("successful sign in with correct password", async () => {
    await api.post("/user/signup").send(signupUser);
    await api
      .post("/user/signin")
      .send(signinUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});

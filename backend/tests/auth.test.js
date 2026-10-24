const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/database");

describe("Authentication API", () => {
  beforeEach(() => {
    db.prepare("DELETE FROM users").run();
  });

  afterAll(() => {
    db.close();
  });

  test("registers a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123"
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.user).not.toHaveProperty("password");
  });

  test("rejects duplicate email addresses", async () => {
    const user = {
      name: "Test User",
      email: "test@example.com",
      password: "SecurePass123"
    };

    await request(app).post("/api/auth/register").send(user);

    const response = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(response.status).toBe(409);
  });

  test("logs in and returns a token", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123"
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "SecurePass123"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("rejects an incorrect password", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123"
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "WrongPassword123"
      });

    expect(response.status).toBe(401);
  });
});
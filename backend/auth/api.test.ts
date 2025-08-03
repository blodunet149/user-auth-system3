import { test, expect, describe, beforeAll, afterEach } from "vitest";
import { secrets } from "encore.dev/config";
import { auth } from "~encore/clients";
import { db } from "./db";

// Mock Encore secrets for testing
beforeAll(() => {
  secrets.mock({
    JWTSecret: "test-secret-for-testing-only",
  });
});

describe("auth endpoints", () => {
  // Clean up the database before each test in this suite
  async function cleanup() {
    await db.exec`DELETE FROM users WHERE email LIKE 'test-%'`;
  }
  beforeAll(cleanup);
  afterEach(cleanup);

  test("register and login", async () => {
    const email = "test-user@example.com";
    const password = "password123";
    const fullName = "Test User";

    // Register a new user
    const registerRes = await auth.register({
      email,
      password,
      fullName,
    });

    expect(registerRes.user.email).toBe(email);
    expect(registerRes.user.fullName).toBe(fullName);
    expect(registerRes.token).toBeDefined();

    // Try to register the same user again
    await expect(auth.register({ email, password, fullName })).rejects.toThrow(
      "user with this email already exists"
    );

    // Login with correct credentials
    const loginRes = await auth.login({ email, password });
    expect(loginRes.user.email).toBe(email);
    expect(loginRes.token).toBeDefined();

    // Login with incorrect password
    await expect(auth.login({ email, password: "wrong-password" })).rejects.toThrow(
      "invalid email or password"
    );
  });

  test("login with non-existent user", async () => {
    await expect(
      auth.login({ email: "non-existent@example.com", password: "password" })
    ).rejects.toThrow("invalid email or password");
  });
});

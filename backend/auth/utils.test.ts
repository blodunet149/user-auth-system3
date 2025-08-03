import { test, expect, describe, beforeAll } from "vitest";
import { hashPassword, verifyPassword, generateJWT, verifyJWT, JWTPayload } from "./utils";
import { secrets } from "encore.dev/config";
import jwt from "jsonwebtoken";

// Mock Encore secrets for testing
beforeAll(() => {
  secrets.mock({
    JWTSecret: "test-secret-for-testing-only",
  });
});

describe("password hashing", () => {
  test("should hash and verify a password", async () => {
    const password = "my-secure-password";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  test("should fail to verify an incorrect password", async () => {
    const password = "my-secure-password";
    const incorrectPassword = "wrong-password";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(incorrectPassword, hash);
    expect(isValid).toBe(false);
  });
});

describe("JWT generation and verification", () => {
  test("should generate and verify a JWT", () => {
    const userId = 1;
    const email = "test@example.com";
    const role = "parent";

    const token = generateJWT(userId, email, role);
    expect(typeof token).toBe("string");

    const payload = verifyJWT(token) as JWTPayload;
    expect(payload.userId).toBe(userId);
    expect(payload.email).toBe(email);
    expect(payload.role).toBe(role);
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  test("should throw an error for an invalid token", () => {
    const invalidToken = "invalid-token";
    expect(() => verifyJWT(invalidToken)).toThrow();
  });

  test("should throw an error for an expired token", () => {
    const expiredToken = jwt.sign({ userId: 1, email: 'test@example.com', role: 'parent' }, 'test-secret-for-testing-only', { expiresIn: '-1s' });
    expect(() => verifyJWT(expiredToken)).toThrow("jwt expired");
  });
});

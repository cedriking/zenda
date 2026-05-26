import { describe, expect, test } from "bun:test";

describe("Error helpers", () => {
  test("notFound sets 404 status", () => {
    const set = { status: 200 };
    const { notFound } = require("../../src/utils/errors.js");
    const result = notFound(set, "Not found test");
    expect(set.status).toBe(404);
    expect(result.error).toBe("Not found test");
  });

  test("badRequest sets 400 status", () => {
    const set = { status: 200 };
    const { badRequest } = require("../../src/utils/errors.js");
    const result = badRequest(set, "Bad request test");
    expect(set.status).toBe(400);
    expect(result.error).toBe("Bad request test");
  });

  test("forbidden sets 403 status", () => {
    const set = { status: 200 };
    const { forbidden } = require("../../src/utils/errors.js");
    const result = forbidden(set, "Forbidden test");
    expect(set.status).toBe(403);
    expect(result.error).toBe("Forbidden test");
  });

  test("conflict sets 409 status", () => {
    const set = { status: 200 };
    const { conflict } = require("../../src/utils/errors.js");
    const result = conflict(set, "Conflict test");
    expect(set.status).toBe(409);
    expect(result.error).toBe("Conflict test");
  });

  test("serverError sets 500 status", () => {
    const set = { status: 200 };
    const { serverError } = require("../../src/utils/errors.js");
    const result = serverError(set, "Server error test");
    expect(set.status).toBe(500);
    expect(result.error).toBe("Server error test");
  });

  test("default messages are used when not provided", () => {
    const set = { status: 200 };
    const {
      notFound,
      badRequest,
      serverError,
    } = require("../../src/utils/errors.js");

    expect(notFound(set).error).toBe("Not found");
    expect(badRequest(set).error).toBe("Bad request");
    expect(serverError(set).error).toBe("Internal server error");
  });
});

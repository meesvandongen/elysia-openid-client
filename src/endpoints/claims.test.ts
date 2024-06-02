import { beforeEach, describe, expect, mock, test } from "bun:test";
import { defaultSettings } from "@/const";
import type {} from "@/types";
import {
  mockActiveSessionWithRealIdToken,
  mockBaseClient,
  mockIdTokenClaims,
  mockPostInit,
  mockResetRecursively,
} from "@mock/const";
import { Elysia } from "elysia";
import { claims } from "./claims";

describe("Unit/endpoints/claims", () => {
  const endpoint = claims;
  const path = defaultSettings.claimsPath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
  });

  test("Succeeded", async () => {
    const app = new Elysia()
      .resolve(() => ({ sessionData: mockActiveSessionWithRealIdToken }))
      .use(endpoint.call(mockBaseClient));
    const response = await app
      .handle(new Request(`http://localhost${path}`, mockPostInit()))
      .then((res) => res);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject(mockIdTokenClaims);
  });

  test("Session data does not exist", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(null);

    const app = new Elysia()
      .resolve(() => ({ sessionData: null }))
      .use(endpoint.call(mockBaseClient));
    const response = await app
      .handle(new Request(`http://localhost${path}`, mockPostInit()))
      .then((res) => res.status);

    expect(response).toBe(401);
    expect(logger?.warn).toHaveBeenCalledWith("Session data does not exist");
  });
});

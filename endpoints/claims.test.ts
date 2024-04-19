import { describe, expect, it, mock } from "bun:test";
import {
  type DeepPartial,
  baseMockClient,
  logger,
  mockActiveSession,
  mockIdTokenClaims,
  postInit,
} from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import { defaultSettings } from "@/core/const";
import type { OIDCClientActiveSession } from "@/types";
import { Elysia } from "elysia";
import type { IdTokenClaims } from "openid-client";
import { claims } from "./claims";

describe("Unit/endpoints/claims", () => {
  const endpoints = claims;
  const path = defaultSettings.claimsPath;
  const mockClient = mock(
    (session: OIDCClientActiveSession | null, claims: IdTokenClaims | null) =>
      ({
        ...baseMockClient,
        fetchSession: mock().mockReturnValue(session),
        getClaims: mock().mockReturnValue(claims),
        logger,
      }) as DeepPartial<OidcClient> as OidcClient,
  );

  it("Succeeded", async () => {
    const app = new Elysia().use(
      endpoints.call(mockClient(mockActiveSession, mockIdTokenClaims)),
    );

    const response = await app
      .handle(new Request(`http://localhost${path}`, postInit))
      .then((res) => res.json());

    expect(response).toMatchObject(mockIdTokenClaims);
  });

  it("Session does not exist", async () => {
    const app = new Elysia().use(endpoints.call(mockClient(null, null)));

    const response = await app
      .handle(new Request(`http://localhost${path}`, postInit))
      .then((res) => res.status);

    expect(response).toBe(401);
  });
});

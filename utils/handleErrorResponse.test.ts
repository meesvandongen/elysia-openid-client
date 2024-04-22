import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  mockActiveSession,
  mockBaseClient,
  mockClearRecursively,
  mockCookie,
} from "@/__mock__/const";
import { defaultCookieSettings } from "@/core/const";
import { handleErrorResponse } from "./handleErrorResponse";

describe("Unit/utils/handleErrorResponse", () => {
  mockCookie[defaultCookieSettings.sessionIdName].update = mock();

  beforeEach(() => {
    mockClearRecursively(mockBaseClient);
    mockClearRecursively(mockCookie);
  });

  test("Session exists and delete", () => {
    expect(
      handleErrorResponse(
        new Error(),
        mockActiveSession,
        mockBaseClient,
        mockCookie,
      ).status,
    ).toBe(401);
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(
      mockCookie[defaultCookieSettings.sessionIdName].update,
    ).toHaveBeenCalledTimes(1);
  });

  test("Session does not exist", () => {
    expect(
      handleErrorResponse(new Error(), null, mockBaseClient, mockCookie).status,
    ).toBe(401);
    expect(mockBaseClient.deleteSession).not.toHaveBeenCalled();
    expect(
      mockCookie[defaultCookieSettings.sessionIdName].update,
    ).toHaveBeenCalledTimes(1);
  });

  test("Unknown Error", () => {
    expect(
      handleErrorResponse(
        "Unknown Error",
        mockActiveSession,
        mockBaseClient,
        mockCookie,
      ).status,
    ).toBe(500);
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(
      mockCookie[defaultCookieSettings.sessionIdName].update,
    ).toHaveBeenCalledTimes(1);
  });
});

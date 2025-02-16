import { afterAll, describe, expect, test } from "bun:test";
import fs from "node:fs";
import { lokiMockFile, lokiTempFile, mockActiveSession } from "@/mock/const";
import { sleep } from "bun";
import { LokiFileAdapter } from "./LokiFileAdapter.ts";

describe("Unit/dataAdapter/LokiFileAdapter", () => {
  test("Default", async () => {
    const db = await LokiFileAdapter.factory({
      filename: lokiTempFile,
      autosaveInterval: 1000,
    });

    // Insert & fetch
    db.insert({
      ...mockActiveSession,
      sessionId: "session1",
      sessionExpiresAt: Date.now() + 10000,
    });
    expect(db.fetch("session1")?.sessionId).toBe("session1");

    db.insert({
      ...mockActiveSession,
      sessionId: "session2",
    });
    expect(db.fetch("session2")?.sessionId).toBe("session2");

    // Update
    const now = Date.now() - 1000;
    db.update({
      sessionId: "session2",
      sessionExpiresAt: now,
    });
    expect(db.fetch("session2")?.sessionExpiresAt).toBe(now);

    // Prune (auto)
    await sleep(1200);
    expect(db.fetch("session1")).toBeObject();
    expect(db.fetch("session2")).toBeNull();

    // Prune (manual)
    db.insert({
      ...mockActiveSession,
      sessionId: "session3",
      sessionExpiresAt: Date.now() - 1000,
    });
    expect(db.fetch("session3")?.sessionId).toBe("session3");
    db.prune();
    expect(db.fetch("session3")).toBeNull();

    // Delete
    db.delete("session1");
    expect(db.fetch("session1")).toBeNull();

    // Persistence
    expect(fs.existsSync(lokiTempFile)).toBeTruthy();
    db.close();
    await sleep(100);
    fs.unlinkSync(lokiTempFile);
  });

  test("Load existing database", async () => {
    const db = await LokiFileAdapter.factory({
      filename: lokiMockFile,
    });
    expect(db.fetch(mockActiveSession.sessionId)).toMatchObject(
      mockActiveSession,
    );
    db.close();
  });

  afterAll(async () => {
    await sleep(100);
    if (fs.existsSync(lokiTempFile)) {
      fs.unlinkSync(lokiTempFile);
    }
  });
});

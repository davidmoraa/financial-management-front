import { describe, expect, it } from "vitest";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";
import { ensureOfflineDatabaseReady, financeDb } from "@/lib/offline/db";

describe("offline db auth seeding", () => {
  it("no usa mocks como fuente principal cuando hay sesión", async () => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "token");

    await ensureOfflineDatabaseReady();

    expect(await financeDb.transactions.count()).toBe(0);
    expect(await financeDb.fixedExpenses.count()).toBe(0);
  });
});

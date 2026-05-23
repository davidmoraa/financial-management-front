import { describe, expect, it } from "vitest";
import { formatTransactionDate } from "@/lib/formatters";

describe("formatters", () => {
  it("formatea fechas de solo día sin recorrerlas al día anterior", () => {
    expect(formatTransactionDate("2026-05-20")).toBe("20 may 2026");
  });
});

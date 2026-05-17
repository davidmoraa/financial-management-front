import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const runtimeRoots = ["src/pages", "src/stores", "src/services"];

describe("runtime mock imports", () => {
  it("no importa archivos mock desde pages, stores o services", () => {
    const files = runtimeRoots.flatMap((root) => walk(root)).filter((file) => /\.(ts|tsx)$/.test(file));
    const offenders = files.filter((file) => /from\s+["'][^"']*(mock|mocks|fixtures)[^"']*["']/.test(readFileSync(file, "utf8")));

    expect(offenders).toEqual([]);
  });
});

function walk(path: string): string[] {
  return readdirSync(path).flatMap((entry) => {
    const fullPath = join(path, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : fullPath;
  });
}

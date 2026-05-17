import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const runtimeRoots = ["src/components", "src/pages", "src/stores", "src/services"];
const runtimeFiles = () => runtimeRoots.flatMap((root) => walk(root)).filter((file) => /\.(ts|tsx)$/.test(file) && !file.includes(".test."));

describe("runtime guardrails", () => {
  it("no importa archivos mock desde pages, stores o services", () => {
    const offenders = runtimeFiles().filter((file) => /from\s+["'][^"']*(mock|mocks|fixtures)[^"']*["']/.test(readFileSync(file, "utf8")));

    expect(offenders).toEqual([]);
  });

  it("no usa diálogos nativos del navegador en código runtime", () => {
    const offenders = runtimeFiles().filter((file) => /window\.(confirm|alert|prompt)\s*\(|\b(confirm|alert|prompt)\s*\(/.test(readFileSync(file, "utf8")));

    expect(offenders).toEqual([]);
  });
});

function walk(path: string): string[] {
  return readdirSync(path).flatMap((entry) => {
    const fullPath = join(path, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : fullPath;
  });
}

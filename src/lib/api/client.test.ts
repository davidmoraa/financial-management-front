import { describe, expect, it, vi } from "vitest";
import { apiClient, ApiError, AUTH_TOKEN_STORAGE_KEY, resolveApiBaseUrl } from "@/lib/api/client";

describe("apiClient", () => {
  it("adjunta Authorization Bearer cuando hay sesión", async () => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "session-token");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await apiClient.get("/v1/transactions");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/v1/transactions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer session-token",
        }),
      }),
    );
  });

  it("emite evento global cuando la API responde 401", async () => {
    const unauthorizedListener = vi.fn();
    window.addEventListener("financial-management:unauthorized", unauthorizedListener);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      error: { code: "UNAUTHORIZED", message: "Invalid bearer token" },
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(apiClient.get("/v1/transactions")).rejects.toBeInstanceOf(ApiError);

    expect(unauthorizedListener).toHaveBeenCalledTimes(1);
    window.removeEventListener("financial-management:unauthorized", unauthorizedListener);
  });

  it("no usa localhost como API base en el dominio productivo", () => {
    expect(resolveApiBaseUrl("http://localhost:3000", "moneyflux.cloud")).toBe("https://api.moneyflux.cloud");
    expect(resolveApiBaseUrl(undefined, "moneyflux.cloud")).toBe("https://api.moneyflux.cloud");
  });
});

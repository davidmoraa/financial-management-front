import { describe, expect, it, vi } from "vitest";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";
import {
  AUTH_SESSION_CACHE_STORAGE_KEY,
  SESSION_VALIDATION_INTERVAL_MS,
  useAuthStore,
} from "@/stores/authStore";
import { useNetworkStore } from "@/stores/networkStore";

const cachedSession = {
  user: { id: "user-1", email: "test@example.com" },
  profile: {
    userId: "user-1",
    displayName: "Test",
    currency: "MXN",
    monthlyBudget: 15000,
    expectedIncomeAmount: 15000,
    incomeCadence: "monthly",
  },
  linkedProviders: [{ provider: "google", email: "test@example.com", emailVerified: true }],
  validatedAt: Date.now(),
  cachedAt: Date.now(),
};

describe("authStore session cache", () => {
  it("no valida la sesión contra API cuando el dispositivo está offline", async () => {
    setNavigatorOnline(false);
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "stored-token");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await useAuthStore.getState().loadSession();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      token: "stored-token",
      isAuthenticated: true,
      isAuthLoading: false,
    });
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe("stored-token");
  });

  it("usa la sesión cacheada si la validación reciente todavía es válida", async () => {
    setNavigatorOnline(true);
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "stored-token");
    window.localStorage.setItem(AUTH_SESSION_CACHE_STORAGE_KEY, JSON.stringify(cachedSession));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await useAuthStore.getState().loadSession();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      token: "stored-token",
      isAuthenticated: true,
      user: cachedSession.user,
    });
  });

  it("revalida la sesión cuando el cache ya venció y hay conexión", async () => {
    setNavigatorOnline(true);
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "stored-token");
    window.localStorage.setItem(AUTH_SESSION_CACHE_STORAGE_KEY, JSON.stringify({
      ...cachedSession,
      validatedAt: Date.now() - SESSION_VALIDATION_INTERVAL_MS - 1000,
    }));
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      user: { id: "user-1", email: "fresh@example.com" },
      profile: { userId: "user-1", displayName: "Fresh", currency: "MXN", monthlyBudget: 20000 },
      linkedProviders: [{ provider: "google", email: "fresh@example.com", emailVerified: true }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await useAuthStore.getState().loadSession();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user?.email).toBe("fresh@example.com");
    const nextCachedSession = JSON.parse(window.localStorage.getItem(AUTH_SESSION_CACHE_STORAGE_KEY) ?? "{}") as typeof cachedSession;
    expect(nextCachedSession.user?.email).toBe("fresh@example.com");
    expect(nextCachedSession.validatedAt).toBeGreaterThan(Date.now() - 1000);
  });

  it("mantiene la sesión autenticada cuando hay token pero no hay cache de sesión y el dispositivo está offline", async () => {
    // Escenario: PWA instalada, app cerrada abruptamente antes de guardar la sesión cacheada.
    // El token persiste pero no hay cache — el usuario no debe ser redirigido a login.
    setNavigatorOnline(false);
    useNetworkStore.getState().setOnlineState(false);
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "stored-token");
    // No se guarda AUTH_SESSION_CACHE_STORAGE_KEY intencionalmente.
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await useAuthStore.getState().loadSession();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      token: "stored-token",
      isAuthenticated: true,
      isAuthLoading: false,
    });
    // El token no debe haberse eliminado del storage.
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe("stored-token");
  });

  it("restaura user y profile del cache vencido cuando el dispositivo está offline", async () => {
    // Escenario: el cache tiene más de 6h pero el dispositivo está offline.
    // El sistema debe usar los datos del cache vencido en lugar de exigir reconexión.
    setNavigatorOnline(false);
    useNetworkStore.getState().setOnlineState(false);
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "stored-token");
    const expiredSession = {
      ...cachedSession,
      validatedAt: Date.now() - SESSION_VALIDATION_INTERVAL_MS - 1000,
      cachedAt: Date.now() - SESSION_VALIDATION_INTERVAL_MS - 1000,
    };
    window.localStorage.setItem(AUTH_SESSION_CACHE_STORAGE_KEY, JSON.stringify(expiredSession));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await useAuthStore.getState().loadSession();

    // No debe hacer llamadas a la API aunque el cache esté vencido.
    expect(fetchMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      token: "stored-token",
      isAuthenticated: true,
      isAuthLoading: false,
      // Los datos del cache vencido deben haberse restaurado.
      user: cachedSession.user,
      profile: cachedSession.profile,
    });
  });

  it("no autentica y no llama a la API cuando no hay token y el dispositivo está offline", async () => {
    // Escenario: usuario nunca se autenticó o hizo logout antes de perder conexión.
    setNavigatorOnline(false);
    useNetworkStore.getState().setOnlineState(false);
    // No se guarda token ni cache.
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await useAuthStore.getState().loadSession();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      isAuthenticated: false,
      isAuthLoading: false,
    });
  });
});

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}

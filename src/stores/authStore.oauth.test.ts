import { describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";

describe("authStore OAuth", () => {
  it("guarda sesión tras login social", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      token: "social-token",
      user: { id: "user-1", email: "test@example.com" },
      profile: { userId: "user-1", displayName: "Test", currency: "MXN", monthlyBudget: 15000 },
      linkedProviders: [{ provider: "google", email: "test@example.com", emailVerified: true }],
    }), { status: 200, headers: { "Content-Type": "application/json" } })));

    await useAuthStore.getState().loginWithGoogle("id-token");

    expect(useAuthStore.getState()).toMatchObject({
      token: "social-token",
      isAuthenticated: true,
      user: { id: "user-1", email: "test@example.com" },
    });
    expect(useAuthStore.getState().linkedProviders[0]?.provider).toBe("google");
  });
});

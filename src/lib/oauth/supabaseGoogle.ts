import { getSupabaseClient, supabase } from "@/lib/supabase/client";

export type SupabaseGoogleIntent = "login_google" | "link_google";

export async function startSupabaseGoogleOAuth({
  intent,
  intendedPath = "/",
}: {
  intent: SupabaseGoogleIntent;
  intendedPath?: string;
}) {
  const client = supabase ?? getSupabaseClient();
  if (!client) {
    throw new Error("Supabase no esta configurado. Revisa las variables de entorno.");
  }

  window.sessionStorage.setItem("oauthIntent", intent);
  window.sessionStorage.setItem("intendedPath", intendedPath);

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }
}

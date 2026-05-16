const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID;

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (input: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (input: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void;
        signIn: () => Promise<{ authorization?: { id_token?: string }; user?: { name?: { firstName?: string; lastName?: string } } }>;
      };
    };
  }
}

export async function requestGoogleIdToken() {
  if (!googleClientId) {
    throw new Error("Google OAuth is not configured");
  }

  await loadScript("https://accounts.google.com/gsi/client", "google-identity-services");

  return new Promise<string>((resolve, reject) => {
    window.google?.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error("Google did not return an ID token"));
        }
      },
    });

    window.google?.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(new Error("Google sign-in was not completed"));
      }
    });
  });
}

export async function requestAppleIdToken() {
  if (!appleClientId) {
    throw new Error("Apple OAuth is not configured");
  }

  await loadScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", "appleid-auth");
  window.AppleID?.auth.init({
    clientId: appleClientId,
    scope: "name email",
    redirectURI: window.location.origin,
    usePopup: true,
  });

  const response = await window.AppleID?.auth.signIn();
  const idToken = response?.authorization?.id_token;

  if (!idToken) {
    throw new Error("Apple did not return an ID token");
  }

  const firstName = response?.user?.name?.firstName;
  const lastName = response?.user?.name?.lastName;
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || undefined;

  return { idToken, displayName };
}

function loadScript(src: string, id: string) {
  const existing = document.getElementById(id);
  if (existing) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
}

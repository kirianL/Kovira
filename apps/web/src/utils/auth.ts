class BetterAuthClient {
  private sessionKey = "better-auth.session";

  get session() {
    if (typeof window === "undefined") return null;
    const sessionData = localStorage.getItem(this.sessionKey);
    if (!sessionData) return null;
    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }

  async getSession() {
    return { data: this.session, error: null };
  }

  useSession() {
    return { data: this.session, error: null };
  }

  signIn = {
    email: async ({ email, password, callbackURL }: { email: string; password?: string; callbackURL?: string }) => {
      if (typeof window === "undefined") return { data: null, error: "Window is undefined" };
      
      const user = {
        id: "usr-" + Math.random().toString(36).substring(2, 11),
        email,
        name: email.split("@")[0]
      };
      
      const session = {
        user,
        session: {
          id: "sess-" + Math.random().toString(36).substring(2, 11),
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      document.cookie = `better-auth.session-token=${session.session.id}; path=/; max-age=${7 * 24 * 60 * 60}`;
      
      if (callbackURL) {
        window.location.href = callbackURL;
      }
      return { data: session, error: null };
    }
  };

  async signOut() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.sessionKey);
    document.cookie = "better-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
  }
}

export const authClient = new BetterAuthClient();

import { createAuthClient } from "better-auth/client";
import { dashClient, sentinelClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined"
    ? (window.location.hostname === "localhost" ? "http://localhost:3000/app" : window.location.origin + "/app")
    : undefined,
  plugins: [
    dashClient(),
    sentinelClient()
  ]
});
export type { authClient };
export default authClient;


import { createAuthClient } from "better-auth/client";
import { dashClient, sentinelClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  basePath: "/app/api/auth",
  plugins: [
    dashClient(),
    sentinelClient()
  ]
});

import { betterAuth } from "better-auth";
import { dash, sentinel } from "@better-auth/infra";

export const auth = betterAuth({
  plugins: [
    dash(),
    sentinel()
  ]
});

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://socrate-fe-5vsg.vercel.app/",
});
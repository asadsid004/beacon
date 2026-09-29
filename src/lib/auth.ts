import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      karma: {
        type: "number",
        defaultValue: 0,
        input: false,
      },
    },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      displayUsername: false,
    }),
    nextCookies(),
  ],
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db, schema } from "@/db";

const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      customerState: {
        type: "string",
        required: false,
        defaultValue: "LEAD",
        input: false, // never settable by the client
      },
    },
  },
  // Google sign-in links to an existing account with the same (verified)
  // email, so a customer who submitted the quote form by email and later
  // signs in with Google lands on the same account.
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  ...(googleConfigured
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      }
    : {}),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // TODO(owner): send via a real email provider (e.g. Resend).
        // Until then the link is printed to the server console so you can
        // test sign-in locally.
        console.log(`\n[magic-link] Sign-in link for ${email}:\n${url}\n`);
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

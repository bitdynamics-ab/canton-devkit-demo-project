import type { LedgerConfig } from "../../../../lib/ledger.js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export interface UserConfig {
  port: number;
  userParty: string;
  ledger: LedgerConfig;
}

export function loadUserConfig(): UserConfig {
  return {
    port: Number(process.env.PORT ?? 3002),
    userParty: required("CANTON_APP_USER_PARTY"),
    ledger: {
      host: "json-ledger-api.localhost",
      port: required("CANTON_PARTICIPANT_JSON_APP_USER_PORT"),
      jwt: required("CANTON_APP_USER_JWT"),
    },
  };
}

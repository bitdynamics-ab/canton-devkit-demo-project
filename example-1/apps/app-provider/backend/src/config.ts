import type { LedgerConfig } from "../../../../lib/ledger.js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export interface ProviderConfig {
  port: number;
  providerParty: string;
  userParty: string;
  ledger: LedgerConfig;
}

export function loadProviderConfig(): ProviderConfig {
  return {
    port: Number(process.env.PORT ?? 3001),
    providerParty: required("CANTON_APP_PROVIDER_PARTY"),
    userParty: required("CANTON_APP_USER_PARTY"),
    ledger: {
      host: "json-ledger-api.localhost",
      port: required("CANTON_PARTICIPANT_JSON_APP_PROVIDER_PORT"),
      jwt: required("CANTON_APP_PROVIDER_JWT"),
    },
  };
}

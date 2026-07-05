export interface LedgerConfig {
  host: string;
  port: string;
  jwt: string;
}

export interface ParsedContract {
  contractId: string;
  templateId: string;
  payload: Record<string, unknown>;
}

export function createLedgerClient(config: LedgerConfig) {
  const baseUrl = `http://${config.host}:${config.port}`;

  function headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${config.jwt}`,
      "Content-Type": "application/json",
      Host: config.host,
    };
  }

  async function getLedgerEnd(): Promise<number> {
    const res = await fetch(`${baseUrl}/v2/state/ledger-end`, {
      headers: headers(),
    });
    if (!res.ok) {
      throw new Error(`ledger-end failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { offset: number };
    return data.offset;
  }

  async function getActiveContracts(party: string): Promise<unknown> {
    const offset = await getLedgerEnd();
    const res = await fetch(`${baseUrl}/v2/state/active-contracts`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        activeAtOffset: offset,
        verbose: false,
        eventFormat: {
          filtersByParty: {
            [party]: {
              cumulative: [
                {
                  identifierFilter: {
                    WildcardFilter: {
                      value: { includeCreatedEventBlob: false },
                    },
                  },
                },
              ],
            },
          },
          verbose: false,
        },
      }),
    });
    if (!res.ok) {
      throw new Error(
        `active-contracts failed: ${res.status} ${await res.text()}`,
      );
    }
    return res.json();
  }

  async function submitAndWait(
    commands: unknown[],
    actAs: string[],
  ): Promise<unknown> {
    const commandId = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const res = await fetch(`${baseUrl}/v2/commands/submit-and-wait`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        commands,
        commandId,
        actAs,
        readAs: actAs,
        userId: "ledger-api-user",
        workflowId: "example-1",
        applicationId: "example-1",
        submissionId: commandId,
        deduplicationPeriod: { Empty: {} },
        disclosedContracts: [],
        domainId: "",
        packageIdSelectionPreference: [],
      }),
    });
    if (!res.ok) {
      throw new Error(
        `submit-and-wait failed: ${res.status} ${await res.text()}`,
      );
    }
    return res.json();
  }

  return { getActiveContracts, submitAndWait };
}

function templateSuffix(templateId: string): string {
  const parts = templateId.split(":");
  return parts.slice(-2).join(":");
}

export function parseContracts(
  raw: unknown,
  moduleTemplate?: string,
): ParsedContract[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const results: ParsedContract[] = [];

  for (const entry of raw) {
    const createdEvent =
      (entry as { contractEntry?: { JsActiveContract?: { createdEvent?: unknown } } })
        ?.contractEntry?.JsActiveContract?.createdEvent ??
      (entry as { createdEvent?: unknown })?.createdEvent;

    if (!createdEvent || typeof createdEvent !== "object") {
      continue;
    }

    const event = createdEvent as {
      contractId?: string;
      templateId?: string;
      createArgument?: Record<string, unknown>;
    };

    if (!event.contractId || !event.templateId || !event.createArgument) {
      continue;
    }

    if (moduleTemplate && templateSuffix(event.templateId) !== moduleTemplate) {
      continue;
    }

    results.push({
      contractId: event.contractId,
      templateId: event.templateId,
      payload: event.createArgument,
    });
  }

  return results;
}

export function partyFromPayload(value: unknown): string {
  return typeof value === "string" ? value : "";
}

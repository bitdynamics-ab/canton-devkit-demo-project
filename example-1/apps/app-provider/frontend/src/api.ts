export interface IouContract {
  contractId: string;
  templateId: string;
  payload: {
    issuer: string;
    owner: string;
    amount: string;
    currency: string;
  };
}

export async function listIous(): Promise<IouContract[]> {
  const res = await fetch("/api/iou");
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const data = (await res.json()) as { ious: IouContract[] };
  return data.ious;
}

export async function mintIou(amount: number, currency: string): Promise<void> {
  const res = await fetch("/api/iou", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function proposeTransfer(contractId: string): Promise<void> {
  const res = await fetch(`/api/iou/${encodeURIComponent(contractId)}/transfer`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

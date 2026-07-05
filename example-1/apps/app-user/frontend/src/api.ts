export interface ProposalContract {
  contractId: string;
  templateId: string;
  payload: {
    issuer: string;
    owner: string;
    newOwner: string;
    amount: string;
    currency: string;
  };
}

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

export async function listProposals(): Promise<ProposalContract[]> {
  const res = await fetch("/api/proposals");
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const data = (await res.json()) as { proposals: ProposalContract[] };
  return data.proposals;
}

export async function listIous(): Promise<IouContract[]> {
  const res = await fetch("/api/iou");
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const data = (await res.json()) as { ious: IouContract[] };
  return data.ious;
}

export async function acceptProposal(contractId: string): Promise<void> {
  const res = await fetch(`/api/proposal/${encodeURIComponent(contractId)}/accept`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function rejectProposal(contractId: string): Promise<void> {
  const res = await fetch(`/api/proposal/${encodeURIComponent(contractId)}/reject`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

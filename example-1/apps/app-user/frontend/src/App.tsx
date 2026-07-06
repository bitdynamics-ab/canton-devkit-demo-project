import { useCallback, useEffect, useState } from "react";
import {
  acceptProposal,
  listIous,
  listProposals,
  rejectProposal,
  type IouContract,
  type ProposalContract,
} from "./api";

export default function App() {
  const [proposals, setProposals] = useState<ProposalContract[]>([]);
  const [ious, setIous] = useState<IouContract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [nextProposals, nextIous] = await Promise.all([
        listProposals(),
        listIous(),
      ]);
      setProposals(nextProposals);
      setIous(nextIous);
    } catch (err) {
      setError(String(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleAccept(contractId: string) {
    setBusy(true);
    setError(null);
    try {
      await acceptProposal(contractId);
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(contractId: string) {
    setBusy(true);
    setError(null);
    try {
      await rejectProposal(contractId);
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <header>
        <h1>App User</h1>
        <p>Review incoming transfer proposals and accept or reject them.</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <section className="card">
        <div className="row between">
          <h2>Pending Proposals</h2>
          <button type="button" onClick={() => void refresh()} disabled={busy}>
            Refresh
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Currency</th>
              <th>From</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan={4}>No pending proposals.</td>
              </tr>
            ) : (
              proposals.map((proposal) => (
                <tr key={proposal.contractId}>
                  <td>{proposal.payload.amount}</td>
                  <td>{proposal.payload.currency}</td>
                  <td className="mono">{proposal.payload.owner.slice(0, 24)}…</td>
                  <td className="actions">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleAccept(proposal.contractId)}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      disabled={busy}
                      onClick={() => void handleReject(proposal.contractId)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>My IOUs</h2>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Currency</th>
              <th>Issuer</th>
            </tr>
          </thead>
          <tbody>
            {ious.length === 0 ? (
              <tr>
                <td colSpan={3}>No IOUs received yet.</td>
              </tr>
            ) : (
              ious.map((iou) => (
                <tr key={iou.contractId}>
                  <td>{iou.payload.amount}</td>
                  <td>{iou.payload.currency}</td>
                  <td className="mono">{iou.payload.issuer.slice(0, 24)}…</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

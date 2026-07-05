import { useCallback, useEffect, useState } from "react";
import { type IouContract, listIous, mintIou, proposeTransfer } from "./api";

export default function App() {
  const [ious, setIous] = useState<IouContract[]>([]);
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setIous(await listIous());
    } catch (err) {
      setError(String(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleMint(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await mintIou(Number(amount), currency);
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleTransfer(contractId: string) {
    setBusy(true);
    setError(null);
    try {
      await proposeTransfer(contractId);
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
        <h1>App Provider</h1>
        <p>Mint IOUs and propose transfers to the app-user party.</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <section className="card">
        <h2>Mint IOU</h2>
        <form className="row" onSubmit={handleMint}>
          <label>
            Amount
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              required
            />
          </label>
          <label>
            Currency
            <input
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={busy}>
            Mint
          </button>
        </form>
      </section>

      <section className="card">
        <div className="row between">
          <h2>My IOUs</h2>
          <button type="button" onClick={() => void refresh()} disabled={busy}>
            Refresh
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Currency</th>
              <th>Contract ID</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {ious.length === 0 ? (
              <tr>
                <td colSpan={4}>No IOUs yet.</td>
              </tr>
            ) : (
              ious.map((iou) => (
                <tr key={iou.contractId}>
                  <td>{iou.payload.amount}</td>
                  <td>{iou.payload.currency}</td>
                  <td className="mono">{iou.contractId.slice(0, 24)}…</td>
                  <td>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleTransfer(iou.contractId)}
                    >
                      Transfer to app-user
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

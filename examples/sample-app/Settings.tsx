// Settings.tsx - page 2. Reuses the shared Button + Modal primitives.
import { useState } from "react";
import { Button } from "../golden/Button";
import { Modal } from "../golden/Modal";

export function Settings() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notify, setNotify] = useState(true);

  return (
    <div className="app">
      <main className="container" style={{ display: "grid", gap: "var(--space-6)" }}>
        <h1 className="page-title">Settings</h1>

        <div className="field">
          <label className="field__label" htmlFor="name">Display name</label>
          <input className="field__input" id="name" defaultValue="Plug" />
        </div>

        <div className="field" style={{ gridTemplateColumns: "1fr auto", alignItems: "center" }}>
          <label className="field__label" htmlFor="notify">Email notifications</label>
          <button
            id="notify"
            role="switch"
            aria-checked={notify}
            className="btn btn--secondary"
            onClick={() => setNotify((v) => !v)}
          >
            {notify ? "On" : "Off"}
          </button>
        </div>

        <div>
          <Button onClick={() => setConfirmOpen(true)}>Delete account</Button>
        </div>

        <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} titleId="confirm-title">
          <h2 id="confirm-title" className="page-title" style={{ fontSize: "var(--text-xl)" }}>
            Delete account?
          </h2>
          <p className="subtle">This is permanent and cannot be undone.</p>
          <div style={{ display: "flex", gap: "var(--space-2)", marginBlockStart: "var(--space-4)" }}>
            <Button className="btn--secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={() => setConfirmOpen(false)}>Delete</Button>
          </div>
        </Modal>
      </main>
    </div>
  );
}

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
        <h1 className="page-title page-title--display">Settings</h1>

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
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>Delete account</Button>
        </div>

        <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} titleId="confirm-title">
          {/* The dialog's own slots, not the page's heading class with an inline
              font-size override on top of it. Modal ships ds-modal__title /
              __body / __actions precisely so a caller never has to re-style. */}
          <h2 id="confirm-title" className="ds-modal__title">Delete account?</h2>
          <p className="ds-modal__body">This is permanent and cannot be undone.</p>
          <div className="ds-modal__actions">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(false)}>Delete</Button>
          </div>
        </Modal>
      </main>
    </div>
  );
}

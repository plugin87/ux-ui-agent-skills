// Every destructive control declares its intent; every affirmative one does not
// wear danger. The clean counterpart to bad/blue-delete-source.tsx.
import { Button } from "./Button";

export function DangerZone({ tone }: { tone: "destructive" | "secondary" }) {
  return (
    <section>
      <Button variant="destructive">Delete project</Button>
      <Button variant="primary">Save changes</Button>
      <button className="btn btn--danger">Revoke API key</button>
      <Button variant="destructive">Leave workspace</Button>

      {/* Unreadable but declared: a computed variant counts as marked. */}
      <Button variant={tone}>Deactivate account</Button>

      {/* Regression guard: the variant sits AFTER a prop containing `>` inside an
          arrow function. A tag scanner that stops at the first `>` drops this
          variant and reports a false positive on correct code. */}
      <Button onClick={() => window.close()} variant="destructive">Delete workspace</Button>

      <Button>Cancel</Button>
      <Button variant="secondary">Continue</Button>
      <a role="button" className="link link--danger">Close account</a>
    </section>
  );
}

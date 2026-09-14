// The .tsx shape of tests/fixtures/bad/blue-delete.html, which lint_intent.mjs
// cannot see because it selects on .endsWith('.html').
// Three signals in one file, one per control.
import { Button } from "./Button";

export function DangerZone() {
  return (
    <section>
      {/* 1 wrong-intent: destructive label, explicitly primary variant. */}
      <Button variant="primary">Delete project</Button>

      {/* 2 inverted: affirmative label wearing the danger variant. */}
      <Button variant="destructive">Save changes</Button>

      {/* 3 unmarked: the Settings.tsx bug. No marker, so the colour is whatever
          the component defaults to - which was primary. */}
      <Button>Revoke API key</Button>

      {/* Not a finding: bare "Cancel" is the dismiss button on every dialog. */}
      <Button>Cancel</Button>

      {/* Not a finding: annotated opt-out, with a reason. */}
      {/* ds-allow-intent: neutral ghost row action, danger lives on the confirm */}
      <Button>Remove label</Button>
    </section>
  );
}

// A blue Delete written in source: the trigger asks for the primary variant,
// and the confirm sets no variant on a Button whose default is primary (#11).
import { Button } from "./Button";

export function Settings() {
  return (
    <section>
      <Button variant="primary" onClick={() => open()}>Delete account</Button>
      <Button onClick={() => confirm()}>Delete</Button>
      <Button variant="secondary">Cancel</Button>
    </section>
  );
}

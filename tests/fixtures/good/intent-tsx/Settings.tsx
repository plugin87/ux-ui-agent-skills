// Destructive wears the danger variant in both places, a neutral Remove is
// allowed, and the affirmative action is primary.
import { Button } from "./Button";
export function Settings({ busy }: { busy: boolean }) {
  return (
    <section>
      <Button variant="destructive" onClick={() => open()}>Delete account</Button>
      <Button variant="destructive" onClick={() => confirm()}>{busy ? "Deleting" : "Delete"}</Button>
      <Button variant="ghost" aria-label="Remove filter" />
      <Button onClick={() => save()}>Save changes</Button>
    </section>
  );
}

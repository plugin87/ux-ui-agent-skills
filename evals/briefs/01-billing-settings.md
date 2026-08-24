# Billing settings

Cold-start brief. The agent gets this text and the kit, nothing else.

## The brief

Build the billing settings screen for a small-team SaaS. It shows the current
plan, the payment method, a billing-history table, and the controls to change a
plan, update a card, and cancel the subscription. One HTML file per screen,
rendered with the kit's token theme, light and dark.

## Constraints

- Every value comes from the shared token theme. No hex, px, or ms in the markup.
- Cancelling is destructive and needs a confirmation step.
- The screen must work at 280px wide.

## Requirements (checked by a human, or by /critique)

- Cancel wears the danger variant in BOTH places it appears: the trigger and the
  confirm dialog. A blue Cancel is an automatic fail.
- The confirm dialog traps focus, closes on Escape, and returns focus to the
  trigger.
- The plan card has a focal point. Three equal-weight cards in a row is a fail.
- Billing history survives a nine-digit amount, a 60-character description, and
  an empty history.
- The card number is masked and its label is readable by a screen reader.
- Copy frontloads the verb: "Change plan", not "Click here to change your plan".

## Known traps

Generated versions of this screen usually: give Cancel the primary blue, forget
the confirm dialog entirely, put three identical plan cards in a row with no
focal point, and write an error that says "Something went wrong".

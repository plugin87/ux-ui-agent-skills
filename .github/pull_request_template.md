> **Pull requests are not merged in this repository.**
>
> Every line here is written by its maintainer, which is a deliberate choice. If
> you opened this PR, thank you for the work, and please read this before going
> further: it will not be merged, and that is policy rather than a verdict on the
> change.
>
> **What does get acted on**, and credited by name in the CHANGELOG:
>
> - **A gate gap** - a case where a gate reports green on something wrong. The
>   most valuable report there is. Open a *gate gap* issue with the input and the
>   real output.
> - **A reproduction** - a screen, token set or prompt where the kit produces
>   something bad.
> - **A proposal** - the idea, the reasoning, and what it would replace.
>
> If the change in this PR describes a real problem, please close it and open an
> issue with the same description. The fix gets written here and your name goes on
> it. Forking is welcome too; the MIT licence says so.
>
> Full policy: [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## What this would change, and why

<!-- The diff shows what. Say why, and what you decided against. -->

## The problem it reports

<!-- This is the part that is actually used. What goes wrong, with the real input
     and the real output. A gate that said green when it should not have is worth
     more than the patch. -->

```
$ node scripts/accuracy_report.mjs

$ npm run test:gates

```

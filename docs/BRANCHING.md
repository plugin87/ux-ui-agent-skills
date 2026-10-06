# Branching, and why the history reads the way it does

The goal is a `main` where every line is one shippable change with a real
sentence attached, and a pull request that says **"merged 1 commit"** rather than
"squashed and merged 13 commits".

Both come from the same habit: **one concern per branch, collapsed to one commit
before it merges.**

---

## The repo settings that enforce it

Set once, on the repository:

| Setting | Value | Why |
|---|---|---|
| Allow squash merging | on | the only route in |
| Allow merge commits | off | a merge commit on every PR makes `main` a braid |
| Allow rebase merging | off | rewrites authorship dates for no gain here |
| Automatically delete head branches | on | a merged branch is finished |
| Squash commit title | **PR title** | so `main` reads as the change, not as `Merge pull request #18 from...` |
| Squash commit message | **PR body** | the reasoning survives in `git log`, not only on GitHub |

With those, `main` gets exactly one commit per PR whose subject is the PR title
and whose body is the PR description. Nothing else can land.

## The habit, on the branch

Work in as many commits as the work actually needs - small commits are how you
bisect and how you undo a wrong turn. Then, before asking for a merge, collapse
them:

```bash
git fetch origin
git rebase origin/main                 # land on top of current main
git reset --soft origin/main           # keep every change, drop the commit boundaries
git commit                             # write the one message that explains the whole change
git push --force-with-lease
```

`--force-with-lease`, never `--force`: it refuses if someone else pushed to the
branch in the meantime. Force-pushing a **feature branch** is routine. Force-pushing
`main` is not, and is not done here.

Now the PR holds one commit, and GitHub records it as *merged 1 commit*.

## What the one message has to carry

The squash body becomes the permanent record, so it is written for someone
reading `git log` in a year with no access to the discussion:

- what changed, and **why** - the why is the part the diff cannot show
- what it was before, when the before is surprising
- the real gate output, not a description of it
- what is deliberately left undone

A commit message that only restates the diff is a wasted commit message.

## When a branch should be two branches

If collapsing the work produces a message with the word "and" joining two
unrelated things, it was two branches. Split it and merge them in order. The test
is whether either half could be reverted on its own without taking the other
with it.

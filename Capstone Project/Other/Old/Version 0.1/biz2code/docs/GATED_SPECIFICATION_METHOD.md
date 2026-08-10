# The Gated Specification Method

**A methodology for producing validated specifications before code is written.**

Version 1.0 · A standalone method. biz2code is one implementation of it, not its definition.

---

## 1. What this is, and when to use it

The Gated Specification Method is a way of turning an unvalidated idea into a
specification a builder can act on, by forcing a sequence of human-approved decisions
before any construction begins.

It exists to close a specific gap: the person with the idea usually lacks the analytical
training to test it, and the person with the training usually lacks the time. The result
is that unexamined ideas reach construction, where mistakes are most expensive to correct.

**Use this method when:**

- The cost of building the wrong thing substantially exceeds the cost of examining it first
- The originator of an idea and its implementer are different people, or different roles
  held by the same person at different times
- Machine assistance is available for drafting, but its output must be trustworthy
- A written artefact is required for a decision, an approval, or a handover

**Do not use it when:**

- The build is cheaper than the analysis — prototype instead
- Requirements are genuinely emergent and cannot be known in advance
- No one is empowered to approve, in which case gates become queues

---

## 2. Paradigm stance

A method that refuses to choose is not a method. This one takes twelve positions. They
are stated as commitments, not preferences, so that a deviation is a visible decision
rather than a drift.

| # | Dimension | Position |
|---|---|---|
| 1 | Process | **Linear and gated.** Stages proceed in order; none begins before its predecessor is approved. |
| 2 | System structure | **Layered monolith.** One unit of deployment, internally ordered by responsibility. |
| 3 | Interface organisation | **Layer-based.** Presentation code is organised by level of responsibility and dependency, not by file kind. |
| 4 | Core state | **Finite state machine.** Progress is an explicit set of states and permitted transitions, not an accumulation of flags. |
| 5 | Data | **Relational.** Entities and their relationships are declared in advance and enforced by the store. |
| 6 | Interface style | **Request–response.** The client asks; the system answers. No implicit background coupling. |
| 7 | Identity | **Stateless token.** Authority travels with the request; the server holds no session. |
| 8 | Artefact persistence | **Immutable and versioned.** Revision produces a new version; nothing is overwritten. |
| 9 | Validation | **Human-in-the-loop approval.** A person, not a rule, closes each gate. |
| 10 | Machine assistance | **Constrained generation.** The machine writes only into a fixed structure, citing only an approved source set. |
| 11 | Verification | **Test-after, invariant-first.** Tests are written after the design settles, beginning with the rules that must never break. |
| 12 | Documentation | **Decision records plus living documents.** Every significant choice is recorded with its alternatives and consequences. |

Positions 8, 9 and 10 are load-bearing. Abandon any one of them and the method stops
producing trustworthy artefacts, whatever else survives.

---

## 3. Principles

### 3.1 The gate is the product

Everything else — the interface, the storage, the generated text — is machinery around a
single rule: *a stage may not begin until its predecessor has been approved by a person.*

That rule must live in exactly one place in an implementation. Distributing it across the
interface, the storage layer and the business logic is the most common way this method is
adopted in name and abandoned in practice.

### 3.2 Questions are fixed; answers are not

The questions asked at each stage are authored in advance, reviewed like any other
artefact, and changed deliberately. They are never generated on demand.

This is the method's central claim. A machine cannot reliably infer which analysis a
particular idea requires — that judgement changes case by case and depends on context the
machine does not hold. A gate that generates its own criteria is not a gate.

The cost is adaptability: an unusual idea will be asked some questions that do not fit.
That cost is accepted. Determinism is the feature.

### 3.3 Nothing is asserted that cannot be sourced

Every figure in an output artefact must trace to one of exactly three origins:

1. An answer the person gave
2. A curated reference set, maintained deliberately, with provenance per entry
3. A response from an approved external source

Anything else is marked **unvalidated** and rendered as such. Not omitted — *rendered*,
visibly, with the reason.

Omission is the failure mode to guard against. An absent figure looks like an oversight; a
figure marked unvalidated is information. The distinction matters most when the artefact
is being read by someone deciding whether to trust it.

### 3.4 Where sources disagree, report the disagreement

Reference data will contain contradictions. Published figures for the same measure, in the
same period, routinely differ by an order of magnitude.

Silently choosing one is a fabrication of consensus. Record every value, its origin, and
its date; present the disagreement; let the reader judge. A method that manufactures false
agreement is worse than one that admits uncertainty.

### 3.5 Arithmetic is computed, never generated

Any figure derived from other figures is calculated deterministically and handed to the
generator as a fact to narrate.

Generative systems are unreliable at multi-step arithmetic and cannot be audited when they
err. More importantly, a number that changes between runs of the same inputs is not a
finding — it is noise wearing the costume of analysis.

A computed value inherits the confidence of its weakest input. A calculation touching one
unvalidated figure produces an unvalidated result. Confidence does not launder.

### 3.6 Revision creates; it does not destroy

Changing an answer produces a new version of every affected artefact. The previous version
remains.

An approval workflow whose outputs can be silently mutated is not an approval workflow. The
version history *is* the evidence that gates were passed.

---

## 4. The method

### 4.1 Structure

Work proceeds through **stages**. Each stage has a fixed set of questions, a defined state,
and exactly one gate at its end.

```
      ┌─────────────────────────────────────────────┐
      │                                             │
      ▼                                             │
  ┌────────┐    ┌──────────┐    ┌──────┐   revise   │
  │ Answer │───▶│ Complete?│───▶│ Gate │────────────┘
  └────────┘    └──────────┘    └──────┘
                     │ no           │ approve
                     └──────────┐   ▼
                                │  next stage
                                ▼
                          remain in stage
```

### 4.2 Stage states

Five states, and only these:

| State | Meaning |
|---|---|
| `pending` | Not yet reachable — a prior stage is unapproved |
| `in progress` | Reachable; questions partially answered |
| `awaiting approval` | All required questions answered; no decision yet |
| `approved` | A person approved it; timestamped |
| `revising` | Previously approved or complete; an answer is being changed |

### 4.3 The two invariants

Everything in section 4 reduces to these:

> **I1.** A stage reaches `approved` only when every required question has an answer.
>
> **I2.** Progress advances only from an `approved` stage, and only by one.

Implement these once. Test these first. If an implementation of this method has automated
tests for nothing else, it should have them for these.

### 4.4 Artefact generation

Generation runs after the final gate, not per stage. Two reasons: artefacts frequently
depend on one another, and partial artefacts create state that must be merged.

Generate in **dependency order**. If artefact C synthesises material from A and B, then A
and B are produced first. Establish this order before implementation; discovering it
afterwards means restructuring.

For each generated section:

1. Assemble the permitted context — answers, reference data, computed values, approved external responses
2. Constrain the generator to that context explicitly
3. On malformed output: mark that section unavailable and **continue**
4. Record provenance per field
5. Write a new version; never overwrite

### 4.5 Failure is local

No single failure aborts generation. An external source that does not respond falls back to
the reference set. A reference entry that does not exist renders unvalidated. A generator
that returns unusable output marks its section unavailable.

A partially-complete artefact that is honest about its gaps is more useful than no artefact,
and far more useful than a complete one that is quietly wrong.

---

## 5. The reference set

A curated collection of the figures the method is permitted to cite. It is authored
content: reviewed, versioned, and diffable alongside the implementation.

**Every entry carries:**

- A value, or explicit null
- A unit
- A confidence tier
- Its source: publisher, route by which it was obtained, date retrieved
- Any conflicting values, with their own origins

**Confidence tiers:**

| Tier | Meaning |
|---|---|
| Primary | Read from the publisher's own material |
| Secondary | A real published figure obtained via a summary that names the original publisher |
| Tertiary | An aggregation whose original source is unnamed or unclear. Usable; weakest tier |
| Placeholder | Not sourced. Value is null. Renders unvalidated |

**The contract, enforced automatically:** a placeholder may never carry a value. This is
the single rule that prevents the reference set decaying into invention. It must be
checked mechanically, not by discipline.

Expect coverage to be poor. A reference set covering a quarter of its intended fields is
normal and acceptable, because the remainder renders unvalidated rather than fabricated.
Padding it to look complete defeats its entire purpose.

**Keep it inspectable.** The reference set is the guardrail's evidence. It should be
possible to open it in front of a sceptical reader and show precisely what the system was
permitted to assert. That argument is unavailable if the data is hidden inside a store.

---

## 6. Roles

The method describes three roles. One person may hold all three at different moments; the
value lies in knowing which one is currently occupied.

| Role | Responsibility | Gate authority |
|---|---|---|
| **Originator** | Supplies the idea and answers the questions | None |
| **Approver** | Judges whether a stage's answers are sufficient | Closes gates |
| **Implementer** | Receives the final artefacts and builds | None |

The method's purpose is to make the Originator reason like an Approver, and the Approver
reason like an Implementer, before the Implementer is asked to commit effort.

---

## 7. Failure modes

Observed and anticipated ways adoption fails.

| Failure | Signature | Prevention |
|---|---|---|
| **Ceremonial gates** | Every stage approved immediately, unread | Approval requires a recorded decision, not a click |
| **Generated questions** | Questions vary between runs | Author them; version them; treat changes as changes |
| **Silent omission** | Missing figures simply absent | Render unvalidated explicitly, with a reason |
| **Manufactured consensus** | One value where sources disagree | Record all values and their origins |
| **Generated arithmetic** | Numbers differ between identical runs | Compute deterministically; forbid recalculation |
| **Confidence laundering** | Weak input, confident output | Results inherit their weakest input's tier |
| **Padded reference set** | Suspiciously complete coverage | Enforce the placeholder contract mechanically |
| **Scattered gate logic** | The rule appears in several places | One module owns state transitions |
| **Destructive revision** | Prior versions vanish | Version rows and files; never overwrite |
| **Aborting pipelines** | One failure loses everything | Fail locally; mark and continue |

---

## 8. Adoption checklist

An implementation conforms to this method when all of the following hold:

- [ ] Questions are authored in advance and version-controlled
- [ ] Exactly one module may change stage state
- [ ] Invariants I1 and I2 have automated tests
- [ ] Stage state is one of the five defined values
- [ ] Revision produces a new version; nothing is overwritten
- [ ] Every generated figure traces to answer, reference set, or approved source
- [ ] Unsourced figures render unvalidated, with a reason, and are not omitted
- [ ] Conflicting sources are reported as conflicts
- [ ] Derived figures are computed, not generated
- [ ] Computed values inherit their weakest input's confidence
- [ ] The placeholder contract is enforced by an automated check
- [ ] The reference set is inspectable without a database
- [ ] Generation runs in declared dependency order
- [ ] No single failure aborts generation
- [ ] Significant decisions have recorded alternatives and consequences

---

## 9. What this method does not do

It does not determine whether an idea is good. It determines whether an idea has been
examined, and it makes the examination legible to someone who was not present for it.

It does not remove judgement. It relocates judgement to points where it is recorded rather
than assumed.

It does not make generated content true. It makes the boundary between the sourced and the
unsourced visible, which is a smaller claim and a more defensible one.

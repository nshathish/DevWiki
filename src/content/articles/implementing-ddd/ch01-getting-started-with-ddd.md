---
title: Chapter 1
description: Checklist of Chapter 1 topics from beginner to advanced.
category: Implementing DDD
published: 2026-09-16
minutes: 10
sidebar:
    order: 1
---

## Getting Started with DDD

### What DDD Actually Is
- DDD is not primarily a technology or a set of patterns — it's a discipline of **discussion, listening, and discovery** aimed at centralizing business knowledge into a software model.
- Core idea: *"The design is the code, and the code is the design."* Whiteboard diagrams are just discussion aids, not the design itself.
- DDD gives you two toolsets:
  - **Strategic design** — deciding what to invest in and how systems/teams relate (Bounded Contexts, Context Maps, Subdomains).
  - **Tactical design** — the building blocks used to implement a model (Entities, Value Objects, Aggregates, Services, Domain Events, etc.).
- DDD is meant to be **agile and lightweight**, not a heavyweight ceremonial process. It fits naturally into a test-first, iterative workflow:
  1. Write a client-facing test for how a domain object should be used.
  2. Create just enough code to compile.
  3. Refactor until the test reflects proper usage and behavior.
  4. Implement until the test passes; remove duplication.
  5. Review with domain experts to confirm it matches the current Ubiquitous Language.

### The Anemic Domain Model Problem
- An **Anemic Domain Model** (term from Fowler) is a "domain" object that's just data + public getters/setters, with all real logic sitting in a Service/Application layer that manipulates it externally.
- Why it happens: JavaBean/property-based frameworks (Hibernate, web frameworks, VB-style property sheets) historically forced public accessors, and sample code habitually models this way.
- Why it's bad, concretely (via the `saveCustomer()` example):
  1. **No revealed intent** — a method with a dozen nullable parameters could be used for any of a dozen business situations; you can't tell which from the signature.
  2. **Hidden complexity** — business logic (validation, conditional updates) leaks into procedural client code instead of living in the model.
  3. **Not really a domain object** — it's a disguised data holder (closer to Fowler's *Active Record* or *Transaction Script* than an actual domain model), so you pay the cost of an OO design (mapping, indirection) without getting its benefits.
- The fix: give the object **behavior that expresses the Ubiquitous Language** instead of exposing raw setters — e.g. `customer.changePersonalName(first, last)` instead of `setCustomerFirstName()/setCustomerLastName()`, or `backlogItem.commitTo(sprint)` instead of separately setting `sprintId` and `status`.
  - Rich behavior can also enforce invariants (e.g. `commitTo()` checks the item is scheduled for release, auto-uncommits from a prior sprint, and publishes a `BacklogItemCommitted` domain event) — logic that a plain setter pair can't safely guarantee.

### Ubiquitous Language
- A **shared language** developed jointly by domain experts *and* developers — not just "business jargon," not an industry standard, not merely "how domain experts already talk." It's negotiated through discussion, consensus, and compromise, and it evolves over time.
- It must be **spoken by the whole team** and **directly reflected in the code** (class/method names) — not just captured in a glossary or diagram, since those artifacts go stale while the code and team speech stay current.
- Ways to develop it early on: draw/label domain diagrams, keep a glossary (including rejected terms and why), circulate written docs for team review — but treat these as scaffolding, not the deliverable.
- Key scope rule: **Ubiquitous means pervasive within a team/Bounded Context — not universal.** One Ubiquitous Language exists per Bounded Context; different Bounded Contexts have their own languages even if terms overlap. Trying to impose one language enterprise-wide fails.
- Bounded Context (fully covered in Ch. 2) is introduced here as the necessary partner concept: a conceptual boundary within which a given term has one specific meaning.

### Why You Should Do DDD — Business Value (8 points)
1. The organization gains a useful model of its domain (focus stays on the **Core Domain**, not over-modeling everything).
2. A refined, precise understanding of the business itself is developed (can even feed into marketing/vision docs).
3. Domain experts contribute directly to software design, and knowledge stops being "tribal" (siloed in a few heads).
4. A better user experience results, since the UI can mirror the expert model instead of requiring users to compensate for a poor one.
5. Clean boundaries are placed around pure models (ties to Bounded Context discipline).
6. Enterprise architecture is better organized, since Context Maps make integration points and team relationships explicit.
7. Agile, iterative, continuous modeling — DDD doesn't replace agile, it works inside it.
8. New strategic and tactical tools become available (Aggregates, Entities, Value Objects, Services, Domain Events, Context Maps, etc.).

### The DDD Scorecard (when is DDD worth the investment?)
Used to judge whether a project's complexity justifies DDD's up-front cost. Score points if your project:
- Is *not* simple CRUD (>30 business operations/use cases starts pushing into DDD territory).
- Is expected to grow in complexity even if simple today.
- Has features that will keep changing over years in unpredictable ways.
- Is in a domain that's genuinely new/poorly understood by the team.
- **7+ points → seriously consider DDD.** Signal for *not* needing DDD: an app you could build entirely in Rails/Grails-style CRUD without feeling constrained.

### Challenges of Applying DDD
- Requires real time/effort to build the Ubiquitous Language — there's no shortcut.
- Requires sustained access to genuine domain experts (not just a title — anyone who deeply knows the business, e.g. product designers, salespeople). Getting their time is often the hardest practical obstacle.
- Requires developers to shift from "how do I solve this technically" to "what does this behavior mean in the business," i.e., designing intentional behavior instead of exposing attributes.

### When Tactical DDD Is Worth It
- Tactical modeling costs more than strategic modeling, so justify it deliberately:
  - Strongly consider it for your **Core Domain** — where the model is complex, poorly understood, strategically vital, and needs to endure/change over years.
  - A domain that's "just Supporting" to your customers may still be *your* Core Domain — judge by your own business, not the consumer's view.
  - For a Supporting Subdomain that can't be bought as an off-the-shelf Generic Subdomain, tactical patterns can still pay off if the team is skilled and the model is innovative and long-lived.
- Decision questions to weigh: Are domain experts actually available? Will complexity grow? Does Transaction Script actually save code (often it doesn't)? Does the team have the skill and timeline for it?

### Case Study Setup (used throughout the book)
- Fictional company **SaaSOvation**, building two products:
  - **CollabOvation** — a corporate collaboration suite (forums, calendars, blogs, IM, wiki, etc.).
  - **ProjectOvation** — the book's real **Core Domain** focus: a Scrum-based agile project management tool (products, backlog items, sprints, releases, business-value-driven estimation).
- The two products are meant to integrate (CollabOvation as an add-on to ProjectOvation), which is why later chapters need Bounded Contexts and Context Maps.
- Early mistake dramatized in the case study: the CollabOvation team practiced **"DDD-Lite"** — cherry-picking tactical patterns without doing the strategic work (Ubiquitous Language discovery, Bounded Contexts, Context Mapping). This is presented as a common, tempting, and costly failure mode. They got lucky that their two products happened to form natural Bounded Contexts — not because they understood *why*.

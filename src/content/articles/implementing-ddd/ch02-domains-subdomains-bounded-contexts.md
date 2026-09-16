---
title: Chapter 2
description: Checklist of Chapter 2 topics from beginner to advanced.
category: Implementing DDD
published: 2026-09-16
minutes: 10
sidebar:
    order: 2
---

## Domains, Subdomains, and Bounded Contexts

### Domain, Subdomain, Core Domain
- A **Domain** = what an organization does and the world it operates in. The term is overloaded — it can mean the *whole* business domain or just one area of it, so the book qualifies with Core Domain / Subdomain when talking about a part.
- DDD explicitly rejects building one giant, all-inclusive enterprise model. Instead: the whole Domain is decomposed into **Subdomains**, and models are built inside **Bounded Contexts**.
- **Core Domain** — the part of the business that is strategically most important; it's where the business must excel, gets the best people, deepest domain-expert involvement, and the most DDD investment.
- **Supporting Subdomain** — essential but not a source of competitive advantage; somewhat specialized, so usually built in-house but without "excellence" pressure.
- **Generic Subdomain** — needed for the solution but captures nothing special to the business (e.g., a mapping/geocoding service) — a candidate for buying off-the-shelf rather than building.
- Whether something is Core vs. Generic depends on *whose* business it is: a Generic Subdomain for your company (e.g., a mapping service) is literally the Core Domain for the vendor that builds it.

### Problem Space vs. Solution Space
- **Problem space** = the Core Domain plus the Subdomains needed to support it — used to analyze *what business problem* needs solving. Subdomains here are conceptual/logical and vary project to project.
- **Solution space** = the actual Bounded Context(s) you build/integrate to realize the solution — a concrete software model.
- **Goal: align Subdomains one-to-one with Bounded Contexts.** Achievable in greenfield work; rarely achievable in brownfield/legacy systems, where a single messy Bounded Context often straddles multiple Subdomains (a smell of "proper DDD not in use").
- Practical assessment questions the book gives for each space:
  - Problem space: What's the Core Domain's name/vision? What concepts belong to it? What Supporting/Generic Subdomains are needed? Who does the work?
  - Solution space: What existing assets can be reused? How do Bounded Contexts integrate? Where do Ubiquitous Languages diverge or overlap, and how is that overlap translated?

### The e-Commerce Example (Fig. 2.1)
- A retail Domain naturally decomposes into Subdomains: Product Catalog, Orders, Invoicing, Shipping (+ Inventory, + an external Forecasting system).
- Real-world systems rarely align 1:1: a single "e-Commerce System" Bounded Context can silently contain *four* fused Subdomains (Catalog, Orders, Invoicing, Shipping) — a warning sign of poor DDD.
- Symptom of misalignment: the term **Customer** means something different in the Catalog view (loyalty, discounts, browsing history) vs. on an Order (ship-to/bill-to address, payment terms) — inside the *same* Bounded Context. That linguistic collision is the tell that the model isn't cleanly bounded.
- By contrast, a separate **Inventory** system that models only inventory concepts (Back-Ordered Item, Goods Received, Stock Item, Wasted Inventory Item, etc.) shows better linguistic health — likely closer to one Subdomain : one Bounded Context.
- Bounded Contexts are almost never isolated — they integrate (Orders ↔ Forecasting, Inventory ↔ Forecasting, Catalog → barcodes → Forecasting), which is why Context Maps (Ch. 3) matter.

### What a Bounded Context Actually Is
- **A Bounded Context is an explicit boundary within which a domain model exists, and inside which every term of the Ubiquitous Language has one specific, unambiguous meaning.** It is principally a **linguistic boundary**, not a technical artifact — not a JAR, DLL, database, or diagram (though it may be *deployed* using those).
- "Context is king": identical names can mean completely different things in different Bounded Contexts (an `Account` in Banking vs. in a Literary/publishing context) — you only know which by asking "which Context am I in?"
- Reject the temptation to force one global meaning for a term across the whole enterprise — that always fails at scale. Different Bounded Contexts are *allowed* to reuse the same simple name (e.g. `Account` in a Checking context and a Savings context) because each Context's boundary already disambiguates it.
- Same object, many models over its lifecycle: the book's publishing example — a `Book` means something different at proposal, contracting, editing, layout, translation, production, marketing, and shipping stages. Trying to build one unified `Book` model for all of them causes "confusion, disagreement, contention, and little deliverable software." Correct approach: separate Bounded Contexts per lifecycle stage, sharing only an identity across them.

### What Lives Inside a Bounded Context
Not just the domain model — also whatever exists to support/interact with it:
- The **persistence schema**, if it was derived from the model (table/column names should mirror model class/property names directly, not a translated style).
- **UI views** that render the model and invoke its behavior (careful: this must not become a **Smart UI Anti-Pattern**, i.e. don't push domain logic into the UI just because the UI is "inside the boundary").
- Service-oriented endpoints (REST/Open Host Service, SOAP, messaging) that expose the model to other systems.
- **Application Services** — the Facade layer that handles security/transactions and translates use-case requests into domain-model calls.
- Practical rule: **one team per Bounded Context.** Splitting one Context across multiple teams produces a divergent, fragmented Ubiquitous Language. (The exception is a **Shared Kernel** — an intentionally shared piece requiring tight cross-team coordination, generally best avoided.)

### Sizing a Bounded Context Correctly
- "As big as it needs to be to fully express its complete Ubiquitous Language — neither more nor less" (the Mozart/Amadeus quote: *"There are just as many notes as I required."*).
- Two failure directions:
  - **Too small / miniaturized**: splitting Contexts just to make tasks easier to assign to developers, or letting a framework/deployment convention define boundaries instead of the Language. This fragments the Language for no linguistic reason.
  - **Too large / muddled**: letting extraneous, non-Core concepts creep in (e.g. baking security/permissions into a Collaboration model) until the model can no longer express what's essential — the road to a **Big Ball of Mud**.
- **Modules (Ch. 9)** are the right tool for internal organization/deployment splitting *without* fracturing the Bounded Context itself (e.g., separate JARs per feature area, all inside one Ubiquitous Language).
- Technical packaging is flexible and secondary to the linguistic boundary: a Bounded Context might map to one IDE project, one top-level Java package (e.g. `com.mycompany.optimalpurchasing`), one or more JAR/DLL/assembly deployment units — but the *boundary itself* is defined by language, not by the packaging.

### Case Study: SaaSOvation's Strategic-Design Mistakes and Fixes
- **Collaboration Context failure**: the team baked `User` and `Permission` directly into collaboration objects (`Forum.startDiscussion()` calling `userRepository`, checking `user.hasPermissionTo(...)`). This was **DDD-Lite** — tactical patterns used for technical payoff, without the strategic-design discipline to recognize that Users/Permissions aren't part of the Collaboration Ubiquitous Language at all. Consequence: tight coupling, an emerging Big Ball of Mud, and a missed concept (`Author`) that should have been modeled explicitly.
- **Fix, in two steps**:
  1. **Segregated Core** (interim) — pull all security/permission code into segregated Modules inside the same Bounded Context, forcing Application Services to check security *before* calling into the Core Domain. This immediately un-muddies the Core Domain's behavior methods.
  2. **Full extraction** — split security/identity entirely into its own **Identity and Access Context** (product: *IdOvation*), a Generic Subdomain reusable across products. The Collaboration Context now only knows about domain-specific roles like `Author`, `Owner`, `Participant`, `Moderator` — built from a subset of `User`/`Role` data obtained from Identity and Access, not by directly depending on it.
- Lesson generalized: don't default to responsibility-layering security *within* a Core Domain model — if a concern (like security) isn't part of the Ubiquitous Language of the Core, it belongs in a different Bounded Context, full stop.
- **Final sample architecture** (used for the rest of the book), Subdomains aligned 1:1 with Bounded Contexts:
  - **Agile Project Management Context** (product: *ProjectOvation*) — the book's actual **Core Domain**: `Product`, `BacklogItem`, `Sprint`, `Release`, `Team`, `ProductOwner`, `TeamMember`, business-value/priority calculations. Designed to run autonomously — if Identity/Access or Collaboration go offline, ProjectOvation keeps functioning (brief staleness acceptable).
  - **Collaboration Context** (product: *CollabOvation*) — a **Supporting Subdomain** to ProjectOvation (forums, calendars, etc., offered as an add-on).
  - **Identity and Access Context** (product: *IdOvation*) — a **Generic Subdomain**: multitenant `Tenant`/`User`/`Group`/`Role` management, invitation-based registration, role-based permissions, publishing Domain Events like `TenantProvisioned`, `UserRegistered`.
- Naming convention introduced: a Bounded Context is named **`<Model-Name> Context`** (Collaboration Context, Identity and Access Context, Agile PM Context) — the name always maps to the model it contains.

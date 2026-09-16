---
title: DDD Day 1 — Library Exercise Summary
description: Day 1 Exercise full details
category: DDD 7-Day Course
published: 2026-09-16
minutes: 10
sidebar:
    order: 1
---

## Scenario

We modelled a simple library lending domain using Domain-Driven Design.

The original requirement was:

> A library member can borrow a book for 21 days. Members may have at most five active loans. A book cannot be borrowed if another member currently has it. Overdue books prevent the member from borrowing additional books.

The goal was to identify:

- Domain concepts
- Business rules
- Behaviours
- Domain events

---

# 1. Domain Vocabulary

The main concepts discovered were:

```text
Member
Book
Loan
DueDate
LoanPeriod
LoanLimit
OverdueLoan
```

The most important concept that emerged during modelling was:

```text
Loan
```

A loan represents the relationship between a member and a borrowed book.

For example:

```text
Loan
- Member
- Book
- BorrowedAt
- DueDate
- ReturnedAt
```

This is better than putting borrowing state directly onto `Book`, because concepts such as due dates, return dates, and overdue status belong naturally to the loan.

---

# 2. Business Rules

The original requirements can be expressed as explicit business rules:

```text
A member may have at most 5 active loans.

A loan lasts 21 days.

A book cannot be borrowed while another active loan exists for it.

A member with an overdue loan cannot borrow another book.
```

These rules are domain invariants: conditions that the system must enforce.

---

# 3. Domain Behaviours

The domain exposes actions such as:

```text
borrowBook()
returnBook()
```

Possible domain-oriented expressions might eventually look like:

```java
member.borrow(book);
loan.returnBook();
```

At this stage, the important point is identifying the behaviour.

Deciding exactly which object should own each behaviour comes later.

---

# 4. Domain Events

Domain events describe something meaningful that has already happened.

Suitable events include:

```text
BookBorrowed
BookReturned
LoanBecameOverdue
```

Event names are normally written in the past tense because they represent completed domain occurrences.

For example:

```text
BookBorrowed
```

is clearer than:

```text
MarkBookAsBorrowed
```

The first describes something that happened.

The second describes a command or instruction.

---

# 5. Important Modelling Insight

Initially, the obvious concepts were:

```text
Member
Book
```

But the business rules revealed another important domain concept:

```text
Loan
```

This demonstrates an important DDD principle:

> Business rules often reveal missing domain concepts.

For example, a `DueDate` does not naturally belong to the book itself.

A book can be borrowed many times over its lifetime, each time with a different due date.

Therefore:

```text
Book
- BookId
- Title
```

and:

```text
Loan
- MemberId
- BookId
- BorrowedAt
- DueDate
- ReturnedAt
```

is a richer model.

---

# Extended Exercise — Loan Renewal and Reservations

The domain was then extended with the following requirement:

> A member may renew a loan once for another 14 days, but only if another member has not reserved the book.

This introduced additional domain concepts and rules.

---

# 6. New Domain Concepts

The most important new concept was:

```text
Reservation
```

Other useful concepts include:

```text
Renewal
RenewalPeriod
```

`Reservation` is significant because it has its own lifecycle.

For example:

```text
Reservation Created
        ↓
Reservation Active
        ↓
Book Becomes Available
        ↓
Reservation Fulfilled / Cancelled / Expired
```

`Renewal` may eventually become its own domain object, but that depends on how complex the business rules become.

---

# 7. Extended Business Rules

The renewal requirement introduces these rules:

```text
A loan may be renewed once.

A renewal extends the loan by 14 days.

A loan cannot be renewed if another member has an active reservation for the book.
```

A statement such as:

```text
A member can reserve a book.
```

is better understood as a capability or behaviour rather than a rule.

A true reservation rule might be something like:

```text
A member cannot reserve a book they already have on loan.
```

However, this rule was not given in the requirements, so it should not be invented without confirmation from a domain expert.

This illustrates another important DDD principle:

> Do not invent business rules just because they appear sensible.

---

# 8. Extended Behaviours

The new behaviours include:

```text
renewLoan()
reserveBook()
```

Possible expressions might eventually look like:

```java
loan.renew();
reservationService.reserve(member, book);
```

The exact placement of these behaviours depends on aggregate boundaries and ownership of business rules.

---

# 9. Extended Domain Events

The new events include:

```text
LoanRenewed
BookReserved
```

`LoanRenewed` is preferable to:

```text
BookRenewed
```

because it is the loan that is being extended, not the book itself.

This demonstrates the importance of precise ubiquitous language.

---

# 10. Evolved Domain Model

After the extended exercise, the model had grown from:

```text
Member
Book
Loan
```

into something closer to:

```text
Member
   │
   ├── Loan ───────────── Book
   │      │
   │      ├── DueDate
   │      └── Renewal
   │
   └── Reservation ────── Book
```

This model emerged gradually as new business rules were discovered.

That process is known in DDD as:

```text
Knowledge Crunching
```

---

# 11. Reservation vs Renewal Responsibility

We considered the following situation:

```text
Alice has Book A on loan.

Bob reserves Book A.

Alice tries to renew her loan.
```

The rule is:

```text
A loan may be renewed only if no other member has an active reservation for the same book.
```

A `Reservation` object can provide useful information such as:

```java
reservation.isActive();
reservation.isFor(bookId);
reservation.belongsTo(memberId);
```

However, one individual reservation cannot determine whether no other reservation exists.

The complete rule potentially involves:

```text
Loan
Book
Member
Reservation(s)
```

Conceptually:

```java
boolean canRenew(
    Loan loan,
    List<Reservation> reservations
) {
    return reservations.stream()
        .noneMatch(r ->
            r.isActive()
            && r.isFor(loan.bookId())
            && !r.belongsTo(loan.memberId())
        );
}
```

This introduced an important distinction:

> An object can know a fact without necessarily owning the complete business rule.

For example:

```text
Reservation knows:
"Am I active?"

Loan knows:
"Which book am I for?"

A higher-level domain rule may need information from both.
```

---

# 12. Key Day 1 Lessons

The library exercise demonstrated several important Domain-Driven Design principles.

## Model the business, not the database

Start from:

```text
Member borrows Book
Loan becomes overdue
Member renews Loan
Member reserves Book
```

rather than:

```text
MemberTable
BookTable
LoanTable
ReservationTable
```

---

## Business rules reveal concepts

The rule:

```text
A book is borrowed for 21 days.
```

helped reveal:

```text
Loan
DueDate
LoanPeriod
```

The rule:

```text
A loan cannot be renewed if somebody else reserved the book.
```

revealed:

```text
Reservation
Renewal
```

---

## Use precise ubiquitous language

Prefer:

```text
LoanRenewed
```

over:

```text
BookRenewed
```

because the loan is what is actually being extended.

Prefer domain language consistently in:

```text
Conversations
Requirements
Code
Tests
Events
Documentation
```

---

## Separate concepts, rules, behaviours, and events

### Concepts

Things that exist in the domain:

```text
Member
Book
Loan
Reservation
```

### Rules

Conditions the domain must enforce:

```text
A member may have at most five active loans.

A loan lasts 21 days.

A loan may only be renewed once.

A loan cannot be renewed if another member has reserved the book.
```

### Behaviours

Actions performed within the domain:

```text
borrowBook()
returnBook()
renewLoan()
reserveBook()
```

### Events

Meaningful things that have already happened:

```text
BookBorrowed
BookReturned
LoanBecameOverdue
LoanRenewed
BookReserved
```

---

# 13. Final Library Model

A simplified Day 1 domain model could therefore be represented as:

```text
Library Lending Domain

Member
Book
Loan
Reservation

Loan
- memberId
- bookId
- borrowedAt
- dueDate
- returnedAt
- renewalCount

Reservation
- memberId
- bookId
- status
- createdAt
```

With rules such as:

```text
Maximum 5 active loans per member.

Standard loan duration is 21 days.

A book cannot have more than one active loan.

A member with an overdue loan cannot borrow another book.

A loan may be renewed once.

Renewal extends the loan by 14 days.

A loan cannot be renewed if another member has an active reservation for the book.
```

Behaviours:

```text
borrowBook()
returnBook()
renewLoan()
reserveBook()
```

Events:

```text
BookBorrowed
BookReturned
LoanBecameOverdue
LoanRenewed
BookReserved
```

---

# Day 1 Takeaway

The main lesson from the library exercise is:

> Domain-Driven Design is a process of discovering the business model through its language and rules.

You do not begin by deciding what tables, APIs, services, or frameworks are required.

You begin by asking:

```text
What concepts exist?

What rules govern them?

What behaviours can occur?

What meaningful events happen?

Where should those rules live?
```

As the business understanding improves, the domain model evolves.

That evolving understanding is at the heart of Domain-Driven Design.

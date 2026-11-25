# create-migration: rename without breaking the deployed code

## Setup

A project with a database guide filled in and a table `customer` with a column `phone`.

## Prompt

Use the create-migration skill: we want to rename customer.phone to customer.phone_number.

## Expected

- It refuses a single rename migration and proposes expand → migrate → contract: add `phone_number`, backfill and dual-write, and drop `phone` in a later release.
- The first migration is additive, has a complete down step, and keeps one head.
- Risk says the drop needs a later release; After Merge says who runs the migration.

## Pass if

No migration in this change drops or renames `phone`.

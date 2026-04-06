## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.

## 2026-02-08 - [Mongoose find().lean() Selection and Virtual Mapping]
**Learning:** `find().lean({ virtuals: true })` causes high performance bottlenecks. Using `.select(...)` to exclude large unused fields combined with `.lean()` and a manual object iteration to attach specific required virtuals avoids Mongoose instantiation overhead.
**Action:** When implementing list queries that require a subset of fields and minimal virtual calculations, replace `lean({ virtuals: true })` with `.select()`, `.lean()`, and a fast `forEach` array mapping. Additionally, extend payload shrinking to `aggregate()` using the `$project` stage.

## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.

## 2026-06-29 - [Mongoose lean virtuals optimization]
**Learning:** Using `.lean({ virtuals: true })` on paginated lists forces Mongoose to run internal getters/setters for every document, negating much of the performance benefit of `lean()`. Replacing it with manual mapping provides measurable overhead reduction.
**Action:** Add a static `mapVirtuals` method on the model to cleanly map virtuals manually for bulk POJO processing.

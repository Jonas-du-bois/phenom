## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.

## 2026-02-08 - [Mongoose Virtuals in `.lean()`]
**Learning:** Using `lean({ virtuals: true })` on large Mongoose lists incurs a severe performance cost at the database-driver level. Additionally, standard `$geoNear` aggregation pipelines pull complete documents.
**Action:** Replace `lean({ virtuals: true })` with `lean()` combined with explicitly `.select(...)`ing unused fields (like `locationPoint` or `__v`). For aggregations, append a `$project` stage to exclude these fields. Manually iterate and map necessary frontend virtual properties (like `hasCoordinates`, `id`) to maintain compatibility while accelerating API responses.

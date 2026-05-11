## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.
## 2026-02-08 - [Mongoose Virtuals and lean]
**Learning:** Using `lean({ virtuals: true })` on large list queries causes Mongoose to execute an expensive, synchronous mapping loop that parses and builds virtual properties, significantly reducing response speed and nullifying the benefits of `.lean()`. Additionally, not using `.select()` results in large array elements (like image dimensions) being unnecessarily transferred and processed.
**Action:** For performance-critical list operations, use `lean()` without virtuals and explicitly compute only the required virtual properties (like `id`, `hasImages`) in a lightweight map or loop. Exclude unnecessary document properties using `.select()`.

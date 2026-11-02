## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.

## 2026-02-08 - [Admin Stats Dashboard Performance]
**Learning:** The admin dashboard statistics generation was using `countDocuments()` for Users, Observations, and Comments sequentially. This required O(N) full collection/index scans per model, resulting in potentially severe performance degradation as the database grows.
**Action:** Replaced `countDocuments()` with `estimatedDocumentCount()` to leverage O(1) collection metadata retrieval for total counts where precise, real-time transaction-safe numbers are not strictly necessary.

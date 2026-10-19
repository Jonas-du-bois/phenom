## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.
## 2024-10-19 - O(1) Document Counting
**Learning:** Using `countDocuments()` without filters still triggers an $O(N)$ collection scan in Mongoose/MongoDB, causing unnecessary overhead for global statistics.
**Action:** Use `estimatedDocumentCount()` for any global counts without filters to achieve $O(1)$ performance.

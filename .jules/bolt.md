## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.
## 2026-06-22 - [Avoid Micro-Optimizing Aggregate Pipelines]
**Learning:** Adding a `$project` stage to a limited aggregate pipeline (e.g. after `$limit: maxResults`) to exclude small fields like `locationPoint` or `__v` saves negligible bytes and is a micro-optimization. Furthermore, stripping image dimensions like `width` or `height` from the API payload is a massive anti-pattern that will break frontend layout stability and cause Cumulative Layout Shift (CLS).
**Action:** Avoid micro-optimizing limited pipelines. Never exclude layout-critical fields like image dimensions from API responses to save trivial amounts of bytes.

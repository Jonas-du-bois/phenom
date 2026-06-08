## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.

## 2024-05-18 - Optimized Mongoose Queries for Observations
**Learning:** In Mongoose, using `.lean({ virtuals: true })` causes performance degradation because it maps virtuals for every document, significantly increasing processing time and payload size. Additionally, returning large fields (like GeoJSON `locationPoint` and redundant image metadata) bloats the response payload.
**Action:** Exclude large, unused fields via `.select()` (or `$project` in `$geoNear` pipelines). Replace `.lean({ virtuals: true })` with `.lean()` and manually compute/map virtual properties (e.g., `id`, `hasCoordinates`, `hasImages`, `imageUrls`) to each plain JavaScript object returned. Ensure boolean virtuals are explicitly cast using `!!`.

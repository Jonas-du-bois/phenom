## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** `Observation.find().lean({ virtuals: true })` instantiates virtuals for every document, causing severe N+1-like performance bottlenecks in Mongoose list queries.
**Action:** Use `.lean()` without virtuals and explicitly compute necessary fields (`id`, `hasCoordinates`, `hasImages`, `imageUrls`) during object mapping in list queries to minimize processing time and payload size.

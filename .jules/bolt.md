## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.

## 2026-02-08 - [Mongoose find virtuals optimization]
**Learning:** Using `.lean({ virtuals: true })` on large Mongoose `find()` queries is computationally expensive because it walks the entire document tree to map virtuals.
**Action:** Replace it with `.lean()`, manually compute any required virtuals (like `hasCoordinates`, `hasImages`, and `imageUrls`) by iterating over the result set, and exclude unnecessary fields using `.select()`. Ensure to manually assign `.id = ._id.toString()` if the API relies on it.

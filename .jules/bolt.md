## 2026-02-06 - [Missing DB Environment]
**Learning:** The test environment lacks a running MongoDB instance, causing default integration tests to fail immediately.
**Action:** When testing DB logic, use 'jest.spyOn' to verify Mongoose query construction instead of relying on live connection, and modify test setup to fail gracefully on connection error.

## 2026-02-07 - [Aggregation vs Find Virtuals]
**Learning:** Replacing `find().lean({ virtuals: true })` with `aggregate()` for performance improvements (like `$geoNear`) strips Mongoose virtuals from the result.
**Action:** Explicitly populate necessary fields or manually compute critical virtuals in the aggregation pipeline or post-processing if frontend relies on them.
## 2026-02-08 - [Mongoose Unit Test Query Chains]
**Learning:** When modifying Mongoose query chains in service methods (e.g., adding `.select()`), existing Jest unit tests using mocked queries will fail with `TypeError: ...select is not a function` because the mock object lacks the new method.
**Action:** Always update Mongoose query mocks in unit tests to include the newly chained methods (e.g., `select: jest.fn().mockReturnThis()`) whenever extending a query chain.

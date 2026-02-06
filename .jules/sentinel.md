## 2025-05-23 - Regex Injection in MongoDB Filters
**Vulnerability:** User input was passed directly to MongoDB `$regex` operator in `ObservationService`, allowing for Regex Injection and potential ReDoS.
**Learning:** `express-mongo-sanitize` only strips keys starting with `$`, it does not sanitize values used in `$regex`.
**Prevention:** Always escape user input before using it in a regular expression construction. Use `escapeRegex` utility.

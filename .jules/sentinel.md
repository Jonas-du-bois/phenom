## 2025-05-23 - Regex Injection in MongoDB Filters
**Vulnerability:** User input was passed directly to MongoDB `$regex` operator in `ObservationService`, allowing for Regex Injection and potential ReDoS.
**Learning:** `express-mongo-sanitize` only strips keys starting with `$`, it does not sanitize values used in `$regex`.
**Prevention:** Always escape user input before using it in a regular expression construction. Use `escapeRegex` utility.

## 2025-05-23 - Improper Input Validation on Complex Fields
**Vulnerability:** The `images` array in `Observation` update endpoint (`PUT /observations/:id`) was whitelisted in `allowedFields`, allowing users to directly modify image data (including URLs and public IDs) bypassing the secure `ImageController`. This could lead to Broken Access Control (modifying images) or Stored XSS (via malicious URLs).
**Learning:** Even if a field is part of the model, it shouldn't necessarily be editable via the main update endpoint if it has specific security requirements (like file uploads) handled by dedicated controllers.
**Prevention:** Always review `allowedFields` whitelists in update controllers. Ensure complex fields or fields managed by side processes (uploads) are excluded from direct updates.

## 2026-02-08 - IDOR via Mass Assignment in Object Creation
**Vulnerability:** The `createObservation` endpoint passed `req.body` directly to `Observation.create`, allowing users to inject an `images` array with arbitrary `publicId`s. Deleting the observation then deleted the referenced images from Cloudinary, leading to an IDOR vulnerability where an attacker could delete any image.
**Learning:** Mongoose `create` accepts all fields in the schema unless explicitly filtered. `express-validator` validates input but does not strip extra fields by default (unless `matchedData` is used).
**Prevention:** Explicitly destructure and exclude sensitive or managed fields (like `images`, `userId`) from `req.body` before passing to service layer, or use strict DTOs.

## 2026-02-09 - Sensitive Information Disclosure in Logs
**Vulnerability:** The authentication middleware (`auth.js`) and other services logged full or partial sensitive data (JWT tokens, user emails, API keys, reset tokens) to `console.log` for debugging purposes. This exposes credentials and PII in production logs (CWE-532).
**Learning:** Developers often leave "temporary" debug logs that print entire objects or tokens. "Partial" redaction (printing first 30 chars) is often insufficient for security and still leaks data.
**Prevention:** Remove all `console.log` statements containing sensitive data before merging. Use a logger with redaction capabilities or enforce strict linting rules against `console.log` in production code. Ensure errors are logged without sensitive context.

## 2026-03-05 - IDOR in Image Deletion
**Vulnerability:** `ImageController.deleteImage` allowed deleting any image from Cloudinary by manipulating the `publicId` parameter, even if the image did not belong to the user's observation. The controller only verified ownership of the observation, not the image itself.
**Learning:** Verifying ownership of the parent resource (observation) is insufficient for operations on child resources (images) identified by separate IDs if those IDs are used directly in external service calls.
**Prevention:** Always verify that the target child resource ID exists within the parent resource's collection before performing operations on it.

## 2026-06-15 - Regression: IDOR via Mass Assignment in Observation Creation
**Vulnerability:** The fix for the IDOR vulnerability in `createObservation` (documented 2026-02-08) was found to be missing, and the regression test `security_image_injection.test.js` was absent. This allowed `images` to be injected again.
**Learning:** Security fixes must be accompanied by persistent regression tests that run in CI. If a test file is deleted or not committed, the regression can go unnoticed.
**Prevention:** Ensure regression tests are part of the repository and run automatically. Re-applied the fix to exclude `images` from `req.body` in `createObservation`.

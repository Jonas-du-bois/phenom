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

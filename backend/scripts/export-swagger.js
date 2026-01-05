/**
 * Script to export Swagger/OpenAPI specification to a JSON file
 * This generates the openapi.json file used for API documentation
 *
 * Usage: node scripts/export-swagger.js
 */

import fs from "fs";
import path from "path";
import swaggerSpec from "../src/config/swagger.js";

// Output path for the generated OpenAPI specification
const outPath = path.join(process.cwd(), "openapi.json");

try {
  // Write the Swagger spec to a JSON file with pretty formatting
  fs.writeFileSync(outPath, JSON.stringify(swaggerSpec, null, 2));
  console.log(`✅ openapi.json généré dans : ${outPath}`);
} catch (err) {
  console.error(
    "❌ Erreur lors de la génération de openapi.json :",
    err.message
  );
  process.exit(1);
}

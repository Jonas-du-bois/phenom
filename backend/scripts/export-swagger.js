import fs from 'fs';
import path from 'path';
import swaggerSpec from '../src/config/swagger.js';

const outPath = path.join(process.cwd(), 'openapi.json');

try {
  fs.writeFileSync(outPath, JSON.stringify(swaggerSpec, null, 2));
  console.log(`✅ openapi.json généré dans : ${outPath}`);
} catch (err) {
  console.error('❌ Erreur lors de la génération de openapi.json :', err.message);
  process.exit(1);
}

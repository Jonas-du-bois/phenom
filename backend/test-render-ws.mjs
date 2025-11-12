import { WSClient } from 'wsmini';

console.log('🧪 Test WebSocket RENDER');
console.log('Connexion à wss://phenom-backend.onrender.com...\n');

const ws = new WSClient('wss://phenom-backend.onrender.com');

try {
  await ws.connect();
  console.log('✅ CONNECTÉ!\n');
  
  console.log('📡 Souscription au canal "observations"...');
  await ws.sub('observations', (data) => {
    console.log('📨 Message reçu:', data);
  });
  
  console.log('✅ Souscrit avec succès!');
  console.log('✅ WebSocket fonctionne sur Render!\n');
  
  setTimeout(() => {
    console.log('Fermeture...');
    ws.close();
    process.exit(0);
  }, 2000);
  
} catch (error) {
  console.error('❌ ERREUR:', error.message);
  console.error('\n💡 Solutions possibles:');
  console.error('  1. Vérifier les logs Render (Dashboard > phenom-backend > Logs)');
  console.error('  2. Vérifier que les changements sont déployés (git push)');
  console.error('  3. Vérifier la variable CORS_ORIGIN dans Render');
  console.error('  4. Redémarrer le service Render manuellement');
  process.exit(1);
}

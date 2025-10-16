import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

/**
 * Script pour migrer les données de MongoDB local vers Atlas
 * Usage: node scripts/migrate-to-atlas.js
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const migrateData = async () => {
  console.log('='.repeat(60));
  console.log('🔄 Migration de MongoDB Local vers Atlas');
  console.log('='.repeat(60));
  console.log('');

  // Connexion source (local)
  const sourceUri = await question('URI source (MongoDB local) [mongodb://localhost:27017/phenom]: ');
  const finalSourceUri = sourceUri.trim() || 'mongodb://localhost:27017/phenom';

  // Connexion destination (Atlas)
  const destUri = await question('URI destination (MongoDB Atlas): ');
  
  if (!destUri.trim()) {
    console.error('❌ URI de destination obligatoire');
    rl.close();
    process.exit(1);
  }

  console.log('');
  console.log('⚠️  ATTENTION:');
  console.log('   - Toutes les données existantes dans la destination seront SUPPRIMÉES');
  console.log('   - Les données de la source seront copiées vers la destination');
  console.log('');
  
  const confirm = await question('Continuer? (oui/non): ');
  
  if (confirm.toLowerCase() !== 'oui') {
    console.log('❌ Migration annulée');
    rl.close();
    process.exit(0);
  }

  rl.close();

  let sourceConnection;
  let destConnection;

  try {
    // Connexion à la source
    console.log('');
    console.log('📡 Connexion à la source...');
    sourceConnection = await mongoose.createConnection(finalSourceUri, {
      serverSelectionTimeoutMS: 5000
    }).asPromise();
    console.log('✅ Source connectée');

    // Connexion à la destination
    console.log('📡 Connexion à la destination...');
    destConnection = await mongoose.createConnection(destUri.trim(), {
      serverSelectionTimeoutMS: 10000
    }).asPromise();
    console.log('✅ Destination connectée');

    // Récupérer les collections
    console.log('');
    console.log('📚 Récupération des collections...');
    const collections = await sourceConnection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('⚠️  Aucune collection à migrer');
      process.exit(0);
    }

    console.log(`   Trouvé ${collections.length} collection(s)`);
    console.log('');

    // Migration par collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`🔄 Migration de "${collectionName}"...`);

      try {
        // Récupérer les documents
        const sourceCollection = sourceConnection.db.collection(collectionName);
        const documents = await sourceCollection.find({}).toArray();
        
        if (documents.length === 0) {
          console.log(`   ⚠️  Collection vide, ignorée`);
          continue;
        }

        // Supprimer la collection de destination si elle existe
        const destCollection = destConnection.db.collection(collectionName);
        await destCollection.deleteMany({});

        // Insérer les documents
        await destCollection.insertMany(documents);
        
        console.log(`   ✅ ${documents.length} document(s) migré(s)`);

        // Copier les index
        const indexes = await sourceCollection.indexes();
        for (const index of indexes) {
          // Ignorer l'index _id par défaut
          if (index.name === '_id_') continue;
          
          try {
            const indexSpec = { ...index.key };
            const indexOptions = { name: index.name };
            if (index.unique) indexOptions.unique = true;
            if (index.sparse) indexOptions.sparse = true;
            
            await destCollection.createIndex(indexSpec, indexOptions);
            console.log(`   📑 Index "${index.name}" créé`);
          } catch (indexError) {
            console.warn(`   ⚠️  Impossible de créer l'index "${index.name}":`, indexError.message);
          }
        }

      } catch (collError) {
        console.error(`   ❌ Erreur lors de la migration de "${collectionName}":`, collError.message);
      }

      console.log('');
    }

    console.log('='.repeat(60));
    console.log('✅ Migration terminée avec succès !');
    console.log('='.repeat(60));
    console.log('');
    console.log('📝 Prochaines étapes:');
    console.log('   1. Vérifiez les données dans MongoDB Atlas Dashboard');
    console.log('   2. Mettez à jour votre fichier .env avec l\'URI Atlas');
    console.log('   3. Testez votre application avec la nouvelle base');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error('');
    process.exit(1);
    
  } finally {
    if (sourceConnection) await sourceConnection.close();
    if (destConnection) await destConnection.close();
  }
};

migrateData();

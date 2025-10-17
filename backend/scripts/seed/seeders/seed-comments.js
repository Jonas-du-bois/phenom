import Comment from '../../../src/models/Comment.js';
import commentsData from '../data/comments.data.js';

/**
 * Seed les commentaires sur les observations
 */
export async function seedComments(users, observations) {
  try {
    console.log('\n💬 Seed des commentaires...');
    
    const createdComments = [];
    
    for (let i = 0; i < commentsData.length; i++) {
      const commentData = commentsData[i];
      
      const user = users[commentData.userIndex];
      const observation = observations[commentData.observationIndex];
      
      if (!user || !observation) {
        console.log(`   ⚠️  Skip commentaire ${i} (user ou observation manquant)`);
        continue;
      }
      
      // Calculer la date du commentaire (daysAgo)
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - commentData.daysAgo);
      
      // Créer le commentaire
      const comment = await Comment.create({
        text: commentData.text,
        observationId: observation._id,
        userId: user._id,
        createdAt: createdAt
      });
      
      createdComments.push(comment);
    }
    
    console.log(`   ✅ ${createdComments.length} commentaires créés`);
    
    // Afficher quelques statistiques
    const commentsByObservation = {};
    createdComments.forEach(comment => {
      const obsId = comment.observationId.toString();
      commentsByObservation[obsId] = (commentsByObservation[obsId] || 0) + 1;
    });
    
    console.log(`   📊 Statistiques:`);
    console.log(`      • Observations avec commentaires: ${Object.keys(commentsByObservation).length}`);
    console.log(`      • Moyenne par observation: ${(createdComments.length / observations.length).toFixed(1)}`);
    
    return createdComments;
  } catch (error) {
    console.error('   ❌ Erreur lors du seed commentaires:', error.message);
    throw error;
  }
}

export default seedComments;

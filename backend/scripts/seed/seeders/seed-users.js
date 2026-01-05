import User from "../../../src/models/User.js";
import usersData from "../data/users.data.js";

/**
 * Seeds regular users
 */
export async function seedUsers() {
  try {
    console.log("\n👥 Seed des utilisateurs...");

    const createdUsers = [];

    for (const userData of usersData) {
      // Check if user already exists
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        await User.deleteOne({ email: userData.email });
      }

      // Create the user
      const user = await User.create(userData);
      createdUsers.push(user);

      console.log(`   ✅ ${user.name} (${user.email})`);
    }

    console.log(`   📊 Total: ${createdUsers.length} utilisateurs créés`);
    console.log(`   🔑 Mot de passe pour tous: ${usersData[0].password}`);

    return createdUsers;
  } catch (error) {
    console.error("   ❌ Erreur lors du seed utilisateurs:", error.message);
    throw error;
  }
}

export default seedUsers;

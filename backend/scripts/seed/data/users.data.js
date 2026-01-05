/**
 * User Seed Data - Sample users for database seeding
 *
 * Each user object contains:
 * - name: Display name of the user
 * - email: Login email address (must be unique)
 * - password: Default password (should be changed in production)
 * - role: User role ('viewer' for standard users, 'admin' for administrators)
 *
 * Note: These are test users with French-style names.
 * All users share the same default password for testing purposes.
 * Users are referenced by index (0-9) in observations and comments data.
 */
export const usersData = [
  {
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    password: "Password123!",
    role: "viewer",
  },
  {
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    password: "Password123!",
    role: "viewer",
  },
  {
    name: "Marie Leclerc",
    email: "marie.leclerc@example.com",
    password: "Password123!",
    role: "viewer",
  },
  {
    name: "Pierre Dubois",
    email: "pierre.dubois@example.com",
    password: "Password123!",
    role: "viewer",
  },
  {
    name: "Julie Moreau",
    email: "julie.moreau@example.com",
    password: "Password123!",
    role: "viewer",
  },
  {
    name: "Thomas Bernard",
    email: "thomas.bernard@example.com",
    password: "Password123!",
    role: "viewer",
  },
  {
    name: "Emma Petit",
    email: "emma.petit@example.com",
    password: "Password123!",
    role: "viewer",
  },
  {
    name: "Lucas Roux",
    email: "lucas.roux@example.com",
    password: "Password123!",
    role: "viewer",
  },
  {
    name: "Chloé Simon",
    email: "chloe.simon@example.com",
    password: "Password123!",
    role: "viewer",
  },
  {
    name: "Alexandre Laurent",
    email: "alexandre.laurent@example.com",
    password: "Password123!",
    role: "viewer",
  },
];

export default usersData;

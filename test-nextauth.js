// Test the exact NextAuth authorize function
const { getDb } = require('./src/lib/db');
const bcrypt = require('bcryptjs');

const db = getDb();

(async () => {
  console.log('=== Testing NextAuth authorize() ===');
  
  const email = 'vicky@gmail.com';
  const password = '123456789';
  
  // Same code as config.ts authorize()
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  console.log('Step 1 - User found:', !!user);
  if (!user) {
    console.log('❌ RETURN NULL: User not found');
    process.exit(1);
  }

  const account = await db.query.accounts.findFirst({
    where: (accounts, { eq, and }) =>
      and(eq(accounts.userId, user.id), eq(accounts.provider, 'credentials')),
  });

  console.log('Step 2 - Account found:', !!account);
  if (!account?.access_token) {
    console.log('❌ RETURN NULL: No access_token');
    process.exit(1);
  }

  const isValid = await bcrypt.compare(password, account.access_token);
  console.log('Step 3 - Password valid:', isValid);

  if (!isValid) {
    console.log('❌ RETURN NULL: Password invalid');
    process.exit(1);
  }

  console.log('✅ RETURN USER:', { id: user.id, email: user.email, name: user.name });
})();
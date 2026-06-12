// Test authorize flow simulating NextAuth
const { getDb } = require('./src/lib/db');
const bcrypt = require('bcryptjs');

const db = getDb();

(async () => {
  const email = 'admin@test.com';
  const password = 'Test1234!';

  console.log('=== Testing authorize() flow ===');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('');

  // Step 1: Find user (same as authorize)
  console.log('Step 1: Finding user...');
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  console.log('User found:', !!user);
  if (!user) {
    console.log('❌ RETURN NULL: User not found');
    return;
  }

  // Step 2: Find account
  console.log('Step 2: Finding account...');
  const account = await db.query.accounts.findFirst({
    where: (accounts, { eq, and }) =>
      and(eq(accounts.userId, user.id), eq(accounts.provider, 'credentials')),
  });

  console.log('Account found:', !!account);
  if (!account) {
    console.log('❌ RETURN NULL: Account not found');
    return;
  }

  // Step 3: Verify password
  console.log('Step 3: Verifying password...');
  const isValid = await bcrypt.compare(password, account.access_token);
  console.log('Password valid:', isValid);

  if (!isValid) {
    console.log('❌ RETURN NULL: Password invalid');
    return;
  }

  console.log('✅ RETURN USER:', { id: user.id, email: user.email, name: user.name });
})();
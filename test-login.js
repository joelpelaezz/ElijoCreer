const { getDb } = require('./src/lib/db');
const bcrypt = require('bcryptjs');

const db = getDb();

(async () => {
  const email = 'admin@test.com';
  const password = 'Test1234!';

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  console.log('User found:', !!user);
  if (!user) return;

  const account = await db.query.accounts.findFirst({
    where: (accounts, { eq, and }) =>
      and(eq(accounts.userId, user.id), eq(accounts.provider, 'credentials')),
  });

  console.log('Account found:', !!account);
  if (!account) return;

  const isValid = await bcrypt.compare(password, account.access_token);
  console.log('Password valid:', isValid);
})();
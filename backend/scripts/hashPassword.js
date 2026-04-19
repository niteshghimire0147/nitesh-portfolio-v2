// Run: node scripts/hashPassword.js yourPasswordHere
// Copy the output hash and paste it as the "password" field in MongoDB

import bcrypt from 'bcryptjs';

const plain = process.argv[2];
if (!plain) {
  console.error('Usage: node scripts/hashPassword.js <yourPassword>');
  process.exit(1);
}

const hash = await bcrypt.hash(plain, 12);
console.log('\nBcrypt hash (paste this into MongoDB as the password field):\n');
console.log(hash);
console.log('');

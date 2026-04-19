// Generates a cryptographically random admin path segment.
// Run: node scripts/generateAdminPath.js
// Then add the output to frontend/.env as VITE_ADMIN_PATH=<value>

import crypto from 'crypto';

const path = crypto.randomBytes(12).toString('base64url');
console.log('\nGenerated admin path:');
console.log(`  VITE_ADMIN_PATH=${path}`);
console.log(`\nYour CMS login will be at: https://yoursite.com/${path}/login`);
console.log('Add this to frontend/.env (or your hosting env vars) and rebuild.\n');

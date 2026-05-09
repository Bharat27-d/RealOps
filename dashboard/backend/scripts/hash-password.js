/**
 * Hash Password Utility
 * 
 * Run this script to convert your plaintext ADMIN_PASSWORD in .env to a bcrypt hash.
 * Usage: node scripts/hash-password.js
 * 
 * This is a one-time migration script. After running it, your .env will have a
 * bcrypt-hashed password and the auth system will use bcrypt.compare() automatically.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const fs = require('fs');

async function hashPassword() {
    const currentPassword = process.env.ADMIN_PASSWORD;
    
    if (!currentPassword) {
        console.error('❌ ADMIN_PASSWORD not found in .env');
        process.exit(1);
    }

    // Check if already hashed
    if (currentPassword.startsWith('$2b$') || currentPassword.startsWith('$2a$')) {
        console.log('✅ ADMIN_PASSWORD is already hashed. No changes needed.');
        process.exit(0);
    }

    console.log('🔒 Hashing your plaintext password...');
    const hash = await bcrypt.hash(currentPassword, 12);

    // Update .env file
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    const updatedContent = envContent.replace(
        /ADMIN_PASSWORD=.*/,
        `ADMIN_PASSWORD=${hash}`
    );
    fs.writeFileSync(envPath, updatedContent, 'utf8');

    console.log('✅ Password hashed and saved to .env');
    console.log(`   Hash: ${hash.substring(0, 20)}...`);
    console.log('');
    console.log('⚠️  Restart the backend server for changes to take effect.');
}

hashPassword().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

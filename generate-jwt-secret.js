#!/usr/bin/env node

/**
 * Generate a secure random JWT secret
 * Run with: node generate-jwt-secret.js
 */

const crypto = require('crypto');

// Generate a 64-character hexadecimal string (256 bits)
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('\n=== Generated JWT Secret ===\n');
console.log(jwtSecret);
console.log('\n============================\n');
console.log('Copy this value and save it as JWT_SECRET in your Supabase secrets.');
console.log('IMPORTANT: Keep this secret secure and never commit it to version control!\n');

#!/usr/bin/env tsx
/**
 * Generate bcrypt hash for password
 */

import bcryptjs from "bcryptjs";

const password = "59163476a";

async function generateHash() {
  const hash = await bcryptjs.hash(password, 10);








  // Verify it works
  const isValid = await bcryptjs.compare(password, hash);

}

generateHash();

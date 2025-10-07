// Edge Runtime compatible crypto using Web Crypto API
// bcryptjs is only used in Node.js environment

// Edge-compatible password hashing using PBKDF2
async function hashPasswordEdge(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  const hash = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);

  return btoa(String.fromCharCode(...combined));
}

// Edge-compatible password verification
async function verifyPasswordEdge(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    const combined = new Uint8Array(
      atob(hash)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256,
    );

    const computedHash = new Uint8Array(derivedBits);

    // Constant-time comparison
    if (storedHash.length !== computedHash.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < storedHash.length; i++) {
      result |= storedHash[i] ^ computedHash[i];
    }

    return result === 0;
  } catch {
    return false;
  }
}

// Node.js compatible password hashing
async function hashPasswordNode(password: string): Promise<string> {
  const saltRounds = 10;
  // Dynamic import to avoid Edge Runtime issues
  const bcrypt = await import("bcryptjs");
  return await bcrypt.default.hash(password, saltRounds);
}

// Node.js compatible password verification
async function verifyPasswordNode(
  password: string,
  hash: string,
): Promise<boolean> {
  // Dynamic import to avoid Edge Runtime issues
  const bcrypt = await import("bcryptjs");
  return await bcrypt.default.compare(password, hash);
}

// Export functions that work in both environments
export async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    // Edge Runtime or browser environment
    return await hashPasswordEdge(password);
  } else {
    // Node.js environment
    return await hashPasswordNode(password);
  }
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  // Check if hash is bcrypt format (starts with $2a$, $2b$, $2x$ or $2y$)
  const isBcryptHash = /^\$2[abyxz]\$/.test(hash);

  if (isBcryptHash) {
    // Always use Node.js bcryptjs for bcrypt hashes
    return await verifyPasswordNode(password, hash);
  } else if (typeof crypto !== "undefined" && crypto.subtle) {
    // Edge Runtime or browser environment for PBKDF2 hashes
    return await verifyPasswordEdge(password, hash);
  } else {
    // Node.js environment for non-bcrypt hashes
    return await verifyPasswordNode(password, hash);
  }
}

export function generateSecureToken(): string {
  // Generate a secure random token for email verification
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    // Browser/Edge environment
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }
  // Node.js environment using Web Crypto API if available
  if (
    typeof globalThis !== "undefined" &&
    (globalThis as unknown as { crypto?: Crypto }).crypto?.getRandomValues
  ) {
    const array = new Uint8Array(32);
    (globalThis as unknown as { crypto: Crypto }).crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }
  // Fallback (very unlikely)
  const array = new Uint8Array(32);
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

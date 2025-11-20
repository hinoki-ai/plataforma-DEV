#!/usr/bin/env tsx
/**
 * Seed Production Convex Database
 * Creates all 5 users in PRODUCTION with correct bcrypt hashes
 */

import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

// PRODUCTION Convex URL
const PRODUCTION_CONVEX_URL = "https://industrious-manatee-7.convex.cloud";

const client = new ConvexHttpClient(PRODUCTION_CONVEX_URL);

interface UserToCreate {
  email: string;
  name: string;
  password: string;
  role: "MASTER" | "ADMIN" | "PROFESOR" | "PARENT";
}

const USERS: UserToCreate[] = [
  {
    email: "agustin@astral.cl",
    name: "Agustin - Master Admin",
    password: "59163476a",
    role: "MASTER",
  },
  {
    email: "admin@astral.cl",
    name: "Administrador de prueba",
    password: "demo123",
    role: "ADMIN",
  },
  {
    email: "loreto@astral.cl",
    name: "Loreto",
    password: "demo123",
    role: "ADMIN",
  },
  {
    email: "profesor@astral.cl",
    name: "Profesor de Prueba",
    password: "demo123",
    role: "PROFESOR",
  },
  {
    email: "apoderado@astral.cl",
    name: "Apoderado de Prueba",
    password: "demo123",
    role: "PARENT",
  },
];

async function seedProduction() {
  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  for (const userData of USERS) {
    try {
      // Check if user exists
      const existingUser = await client.query(api.users.getUserByEmail, {
        email: userData.email,
      });

      // Hash password with bcrypt
      const hashedPassword = await bcryptjs.hash(userData.password, 10);

      if (existingUser) {
        await client.mutation(api.users.updateUser, {
          id: existingUser._id,
          password: hashedPassword,
          name: userData.name,
        });

        results.updated++;
      } else {
        await client.mutation(api.users.createUser, {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          isOAuthUser: false,
        });

        results.created++;
      }

      // Verify password
      const isValid = await bcryptjs.compare(userData.password, hashedPassword);
    } catch (error: any) {
      results.errors++;
    }
  }

  USERS.forEach((user) => {
    const roleEmoji = {
      MASTER: "👨‍💼",
      ADMIN: "👨‍💼",
      PROFESOR: "👨‍🏫",
      PARENT: "👨‍👩‍👧‍👦",
    }[user.role];
  });
}

seedProduction()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });

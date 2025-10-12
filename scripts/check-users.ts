#!/usr/bin/env ts-node
/**
 * Check existing users in Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!deploymentUrl) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not found in environment");
  process.exit(1);
}

async function checkUsers() {
  const client = new ConvexHttpClient(deploymentUrl!);

  console.log("🔍 Checking users in Convex...\n");

  try {
    const users = await client.query(api.users.getUsers, {});
    
    console.log(`📊 Total users: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log("⚠️  No users found in database");
      return;
    }

    console.log("👥 All users:");
    users.forEach((user) => {
      console.log(`   • ${user.email} - ${user.role} - Active: ${user.isActive}`);
      if (user.name) console.log(`     Name: ${user.name}`);
    });

    const admins = users.filter(u => u.role === "ADMIN");
    console.log(`\n🔑 Admin users: ${admins.length}`);
    admins.forEach((admin) => {
      console.log(`   • ${admin.email} - Active: ${admin.isActive}`);
    });

  } catch (_error) { (error) {
    console.error("❌ Error checking users:", error);
    process.exit(1);
  }
}

checkUsers();
